import { error } from 'console'
import { Router } from 'express'
import { register } from 'module'
import { nextTick } from 'process'
import { json } from 'stream/consumers'
import {
  emailVerifyController,
  emailVerifyTokenValidator,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
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
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))
/*
des: verify email khi người dùng nhấn vào cái link trong email, họ sẽ gữi lên email_verify_token
để ta kiểm tra, tìm kiếm user đó và update account của họ thành verify, 
đồng thời gữi at rf cho họ đăng nhập luôn, k cần login
path: /verify-email
method: POST
không cần Header vì chưa đăng nhập vẫn có thể verify-email
body: {email_verify_token: string}
*/
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyController))
//emailVerifyTokenValidator và emailVerifyController chưa có giờ tạo
/*
des:gữi lại verify email khi người dùng nhấn vào nút gữi lại email,
path: /resend-verify-email
method: POST
Header:{Authorization: Bearer <access_token>} //đăng nhập mới cho resend email verify
body: {}
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

//vì người dùng sẽ truyền lên accesstoken, nên ta sẽ dùng lại accessTokenValidator để kiểm tra
//accesstoken đó

//:
//resendEmailVerifyController:
//    1. kiểm tra xem account đã verify chưa, nếu nó verify rồi thì ta
//      không cần tiến hành gữi email lại cho client
//    2. nếu chưa verify thì controller ta sẽ tạo để xử lý việc resend email verify
//    controller này ta chưa code , giờ ta tiến hành code
/*
des: cung cấp email để reset password, gữi email cho người dùng
path: /forgot-password
method: POST
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {email: string}
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))
/*
des: verify forgot password token
người dùng sau khi báo forgot password, họ sẽ nhận được 1 email
họ vào và click vào link trong email đó, link đó sẽ có 1 request đính kèm
forgot_password_token và gửi lên server /users/verify-forgot-password-token
mình sẽ verify cái token này nếu thành công thì mình sẽ cho ngta reset password
method: POST
path: /users/verify-fotgot-password-token
body: {forgot_password_token: string}
*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)
export default usersRouter
