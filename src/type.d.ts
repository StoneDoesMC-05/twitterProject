import { TokenPayload } from './models/requests/User.request'
import User from './models/schemas/User.schema'
import { Request } from 'express'

// định nghĩa lại Request
declare module 'express' {
  interface Request {
    user?: User //thêm ? vì k phải request nào cũng có user
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}
