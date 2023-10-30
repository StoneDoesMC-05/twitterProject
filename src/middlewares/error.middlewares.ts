import { NextFunction, Response, Request } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err.message)
  // Nơi tập kết lỗi từ mọi nơi trên hệ thống về
  // Nếu lỗi nhận được thuộc dạng ErrorWithStatus thì trả về status và message
  if(err instanceof ErrorWithStatus){
    return res.status(err.status).json(omit(err, ['status']))
  }
  // còn nếu code mà chạy xuống được đây thì error sẽ là 1 lỗi mặc định
  // err{message, stack, name}
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  // Ném lỗi đó cho người dùng
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errInfor: omit(err, ['stack'])
  })
}
