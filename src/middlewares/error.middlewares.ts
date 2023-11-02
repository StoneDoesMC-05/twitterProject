import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
// trong er thi có status va mesage
// noi tap ket loi tu moi noi do ve
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  //err là lỗi từ các nơi khác truyền xuống, và ta đã quy ước lỗi phải là 1 object có 2 thuộc tính: status và message
  if (err instanceof ErrorWithStatus) {
    //nếu err là 1 instance của ErrorWithStatus
    //thì ta sẽ trả về status và message của err đó
    return res.status(err.status).json(omit(err, ['status']))
  }
  //Object.getOwnPropertyNames(err) trả về 1 mảng các key của err
  //forEach sẽ duyệt qua từng key
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: err.message,
      // errorInfor: err //truyền vậy là truyền lên cả stack(full lỗi và đường dẫn của file lỗi)
      errorInfor: omit(err, ['stack']) //truyền vậy là chỉ truyền lên message
    })
  })
}
