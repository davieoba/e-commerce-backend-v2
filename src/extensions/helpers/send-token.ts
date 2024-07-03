import jwt from "jsonwebtoken"
import { Response } from "express"
import {
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  GOOGLE_REDIRECT_URI,
} from "../../config/app.keys"

const sendToken = async (user: any, statusCode: number, res: Response) => {}

export default sendToken
