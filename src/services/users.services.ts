import Users from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { TokenType } from '~/constants/enums'
import { signToken } from '~/utils/jwt'
import { config } from 'dotenv'
config()
class UserServices {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.user.insertOne(
      new Users({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    // Lấy user_id từ account vừa tạo
    const user_id = result.insertedId.toString()
    // Từ user_id tạo ra 1 access token và 1 refresh token
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    return { access_token, refresh_token }
  }
  async checkEmailExist(email: string) {
    //Vào database tìm user có email này
    const user = await databaseService.user.findOne({ email })
    return Boolean(user)
  }
}
const userServices = new UserServices()
export default userServices
