import { NextFunction, Request, Response } from 'express'
import Users from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
import exp from 'constants'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'

export const loginController = async (req: Request, res: Response) => {
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
