import { NextFunction, Request, Response } from 'express'
import Users from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ForgotPasswordReqBody,
  LoginReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.request'
import exp from 'constants'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { capitalize } from 'lodash'
import { JsonWebTokenError } from 'jsonwebtoken'
import userService from '~/services/users.services'
import { UserVerifyStatus } from '~/constants/enums'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  // vào req lấy user ra, và lấy id của user đó
  const user = req.user as Users
  const user_id = user._id as ObjectId
  // dùng cái user_id đó để tạo access và refresh
  const result = await userServices.login(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESSFULLY,
    result
  })
}
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  // Tạo một user mới và bỏ vào collection users trong database
  const result = await userServices.register(req.body)
  return res.status(201).json({
    message: USERS_MESSAGES.REGISTER_SUCCESSFULLY,
    result
  })
}
export const logoutController = async (req: Request, res: Response) => {
  const refresh_token = req.body.refresh_token
  const result = await userServices.logout(refresh_token) //hàm trả ra chuỗi báo logout thành công
  return res.json(result)
}
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true, //thêm
        custom: {
          options: async (value: string, { req }) => {
            //check xem người dùng có gữi lên email_verify_token không, nếu k thì lỗi
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED //401
              })
            }
            try {
              //nếu có thì ta verify nó để có đc thông tin của người dùng
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })

              //nếu có thì ta lưu decoded_email_verify_token vào req để khi nào muốn biết ai gữi req thì dùng
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              //trong middleware này ta throw để lỗi về default error handler xử lý
              if (error instanceof JsonWebTokenError) {
                //nếu lỗi thuộc verify thì ta sẽ trả về lỗi này
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED //401
                })
              }
              //còn nếu không phải thì ta sẽ trả về lỗi do ta throw ở trên try
              throw error // này là lỗi đã tạo trên try
            }

            return true //nếu không có lỗi thì trả về true
          }
        }
      }
    },
    ['body']
  )
)
export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  // const { email_verify_token } = req.body
  // const user = await databaseService.users.findOne({ email_verify_token: email_verify_token })
  //ta có thể tìm user thông qua email_verify_token do người dùng gui lên lên thế này nhưng hiệu năng sẽ kém
  //nên thay vào đó ta sẽ lấy thông tin _id của user từ decoded_email_verify_token mà ta thu đc từ middleware trước
  //và tìm user thông qua _id đó
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.user.findOne({
    _id: new ObjectId(user_id)
  }) //hiệu năng cao hơn
  //nếu k có user thì cho lỗi 404: not found

  if (user === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  //nếu mà email_verify_token là rỗng: tức là account đã đc verify email trước đó rồi
  //thì mình sẽ trả về status 200 ok, với message là đã verify email trước đó rồi
  //chứ không trả về lỗi, nếu k thì client sẽ bối rối
  if (user.email_verify_token === '') {
    //mặc định là status 200
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await userService.verifyEmail(user_id)
  //để cập nhật lại email_verify_token thành rỗng và tạo ra access_token và refresh_token mới
  //gữi cho người vừa request email verify đang nhập
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result: result
  })
}
export const resendEmailVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  //khi đến đây thì accesstokenValidator đã chạy rồi => access_token đã đc decode
  //và lưu vào req.user, nên trong đó sẽ có user._id để tao sử dụng
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization
  //từ user_id này ta sẽ tìm user trong database
  const user = await databaseService.user.findOne({
    _id: new ObjectId(user_id)
  })
  //nếu k có user thì trả về lỗi 404: not found
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  //nếu user đã verify email trước đó rồi thì trả về lỗi 400: bad request
  if (user.verify == UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  //nếu user chưa verify email thì ta sẽ gữi lại email verify cho họ
  //cập nhật email_verify_token mới và gữi lại email verify cho họ
  const result = await userServices.resendEmailVerify(user_id)
  //result chứa message nên ta chỉ cần trả  result về cho client
  return res.json(result)
}
export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  //middleware forgotPasswordValidator đã chạy rồi, nên ta có thể lấy _id từ user đã tìm đc bằng email
  const { _id } = req.user as Users
  //cái _id này là objectid, nên ta phải chuyển nó về string
  //chứ không truyền trực tiếp vào hàm forgotPassword
  const result = await userService.forgotPassword((_id as ObjectId).toString())
  return res.json(result)
}
export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  //nếu đã đến bước này nghĩa là ta đã tìm có forgot_password_token hợp lệ
  //và đã lưu vào req.decoded_forgot_password_token
  //thông tin của user
  //ta chỉ cần thông báo rằng token hợp lệ
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}
