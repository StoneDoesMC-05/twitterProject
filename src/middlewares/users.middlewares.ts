// Một ai đó truy cập vào /login
// client sẽ gửi cho mình username và password
// client sẽ tạo 1 req gửi server
// thì username và password sẽ nằm ở req.body

import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import userServices from '~/services/users.services'
import { validate } from '~/utils/validation'

// viết 1 middleware xử lý validator của req body
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      message: 'Missing email or password'
    })
  }
  next()
}
//khi register thì ta sẽ có 1 req.body gồm
// {
//   name: string,
//   email: string,
//   password: string,
//   confirm_password: string,
//   date_of_birth: ISO8601,
// }
export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      }
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const isExistEmail = await userServices.checkEmailExist(value)
          if (isExistEmail) {
            throw new Error('email already exists')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 8,
          max: 100
        }
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          returnScore: true
        }
      },
      errorMessage: `password must be at least 8 chars long, contain at least 1 lowercase letter, 1 uppercase letter, 1 numeber, and 1 symbol`
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 8,
          max: 100
        }
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          returnScore: true
        }
      },
      errorMessage: `confirm_password must be at least 8 chars long, contain at least 1 lowercase letter, 1 uppercase letter, 1 numeber, and 1 symbol`,
      custom: {
        options: (value, { req }) => {
          if (value != req.body.password) {
            throw new Error('confirm_password does not match password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
