import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { register } from 'module'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { TokenType } from '~/constants/enums'
import { signToken } from '~/utils/jwt'
import { config } from 'dotenv'
config()
class UserService {
  async checkEmailExist(email: string) {
    const user = await databaseService.user.findOne({ email })
    return Boolean(user)
  }
  async register(payload: RegisterReqBody) {
    const result = await databaseService.user.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    //lấy user_id từ user mới tạo
    const user_id = result.insertedId.toString()
    const [AccessToken, RefreshToken] = await this.signAccessTokenRefreshToken(user_id)
    return [AccessToken, RefreshToken]
  }

  //Viết hàm nhận vào userID để bỏ vào payload tạo access token
  signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  private signAccessTokenRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefershToken(user_id)])
  }

  //Viết hàm nhận vào userID để bỏ vào payload tạo refresh token

  signRefershToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }
  async login(user_id: string) {
    const [AccessToken, RefreshToken] = await this.signAccessTokenRefreshToken(user_id)
    return [AccessToken, RefreshToken]
    //dùng cái user_id tạo access và refresh token
    //return cái access token và refresh token cho controller
    //controller sẽ trả về cho client
  }
}

const userService = new UserService()
export default userService