import { Request, Response } from 'express'
import Users from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'test@gmail.com' && password === '123456') {
    res.json({
      data: [
        { fanme: 'Diep', yob: 1999 },
        { fanme: 'Hung', yob: 2001 },
        { fanme: 'Duoc', yob: 2002 }
      ]
    })
  } else {
    res.status(400).json({
      message: 'Login failed!'
    })
  }
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    // Tạo một user mới và bỏ vào collection users trong database
    const result = await userServices.register(req.body)
    return res.status(201).json({
      message: 'Register successfully',
      result
    })
  } catch (error) {
    return res.status(400).json({
      message: 'Register failed',
      error
    })
  }
}
