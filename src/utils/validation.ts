import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus, EntityError } from '~/models/Errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)

    if (errors.isEmpty()) {
      return next()
    }

    const errorObjects = errors.mapped()
    const entityError = new EntityError({ errors: {} })

    for (const key in errorObjects) {
      //Đi qua từng lỗi và lấy msg
      const { msg } = errorObjects[key]
      // Nếu lỗi đặc biệt do mình tao ra khác 422 thì mình next cho defaultErrorHandler
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      // Nếu không phải lỗi đặc biệt thì mình chắc chắn là lỗi 422
      // thì mình lưu vào entityError
      entityError.errors[key] = msg
    }
    next(entityError)
  }
}
