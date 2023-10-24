import { NextFunction, Request, Response } from 'express'
import Users from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
import exp from 'constants'

export const loginController = async (req: Request, res: Response) => {
  // vào req lấy user ra, và lấy id của user đó
  const { user }: any = req
  const user_id = user.id
  // dùng cái user_id đó để tạo access và refresh
  const result = await userServices.login(user_id)
  return res.json({
    message: 'login successfully',
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
    message: 'Register successfully',
    result
  })
}
