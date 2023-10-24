import { error } from 'console'
import { Router } from 'express'
import { register } from 'module'
import { nextTick } from 'process'
import { json } from 'stream/consumers'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()
usersRouter.get('/login', loginValidator, loginController)
// usersRouter.post('/register', registerValidator, registerController)
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
export default usersRouter
