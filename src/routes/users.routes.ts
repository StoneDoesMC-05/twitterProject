import { error } from 'console'
import { Router } from 'express'
import { register } from 'module'
import { nextTick } from 'process'
import { json } from 'stream/consumers'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()
usersRouter.get('/login', loginValidator, wrapAsync(loginController))
// usersRouter.post('/register', registerValidator, registerController)
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
// Logout
/*
des: đăng xuất
path: user/logout
methid: POST
Header: (Authorization: 'Bearer <access_token>')
body: {refresh_token: string}
*/
usersRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapAsync((req: any, res: any) => {
    res.json({ message: 'Logout success' })
  })
)
export default usersRouter
