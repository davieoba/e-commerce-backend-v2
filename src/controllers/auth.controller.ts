import jwt, { JwtPayload } from "jsonwebtoken"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { NextFunction, Request, Response } from "express"
import User from "../entity/user.entity"
import AppError from "../extensions/libs/app-error"
import catchAsync from "../extensions/libs/catch-async"
import sendToken from "../extensions/helpers/send-token"
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../config/app.keys"
import { loginSchema, registerSchema } from "../extensions/schemas/auth.schema"

class AuthController {
  static register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = registerSchema.validate(req.body)
      if (error) {
        return new AppError(error.details[0].message, 400)
      }

      const { name, email, password } = value
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return next(new AppError("Email already in use", 400))
      }

      const user = await User.create({ name, email, password })
      if (!user) {
        return next(new AppError("Bad Request, try again!", 400))
      }

      sendToken(user, 201, res)
    }
  )

  static login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = loginSchema.validate(req.body)
      if (error) {
        return new AppError(error.details[0].message, 400)
      }
      const { email, password } = value
      const user = await User.findOne({ email: email }).select("+password")
      if (!user) return next(new AppError("Invalid email or password", 401))
      const auth = user.comparePassword(password)
      if (auth === false)
        return next(new AppError("Invalid user or password", 401))

      sendToken(user, 200, res)
    }
  )

  static refresh = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let token
      if (req?.cookies) {
        token =
          process.env.NODE_ENV === "development"
            ? req?.cookies?.sage_warehouse_token
            : req?.cookies["__Host-sage_warehouse_token"]
      }
      if (!token) return next(new AppError("Access Denied", 405))
      let decoded = null
      try {
        decoded = jwt.verify(token, String(REFRESH_TOKEN_SECRET)) as JwtPayload
      } catch (err) {
        return next(new AppError("Invalid Credentials", 401))
      }

      const user = await User.findById(decoded.id)
      if (!user) return next(new AppError("No user found", 400))

      const accessToken = jwt.sign(
        { id: decoded.id },
        String(ACCESS_TOKEN_SECRET),
        {
          expiresIn: ACCESS_TOKEN_EXPIRY,
        }
      )

      res
        .header("Authorization", accessToken)
        .status(200)
        .json({
          message: "success",
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: accessToken,
            role: user.role,
            photo: user.avatar,
            cart: user.cart.length,
          },
        })
    }
  )

  static authenticate = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let token = null
      if (req.headers.authorization) {
        token = req.headers.authorization
      }
      if (!token) {
        return next(new AppError("Login to access resource", 401))
      }

      let decoded = null
      try {
        decoded = jwt.verify(token, String(ACCESS_TOKEN_SECRET)) as JwtPayload
      } catch (err) {
        return next(new AppError("Invalid Credentials, Login", 401))
      }
      const user = await User.findById(decoded.id)
      if (!user) return next(new AppError("The user is invalid", 400))
      if (user.changedPasswordAfter(decoded.iat!)) {
        return next(new AppError("User recently changed password", 401))
      }

      req.user = user
      // res.header('Authorization', token)
      next()
    }
  )

  static logout = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      res
        .clearCookie(
          process.env.NODE_ENV === "development"
            ? "sage_warehouse_token"
            : "__Host-sage_warehouse_token"
        )
        .header("Authorization", "")
        .status(200)
        .json({
          success: true,
          message: "User logged out",
        })
    }
  )

  static restrictTo = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (req.user && !roles.includes(req.user.role)) {
        return next(
          new AppError("You do not have permission to perform this action", 403)
        )
      }

      next()
    }
  }

  static forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findOne({ email: req.body.email })

      if (!user) return next(new AppError("No registered user found", 404))

      const resetToken = user.generatePasswordResetToken()
      await user.save({ validateBeforeSave: false })

      const url = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/reset/${resetToken}`

      try {
        const userDetails = {
          name: user.name,
          email: user.email,
        }
        // Todo: SEND EMAIL TO THE USER
        // await new Email(userDetails, url).sendPasswordReset().then(() => {
        //   res.status(200).json({
        //     status: "success",
        //     message: "Email sent successfully",
        //   })
        // })
      } catch (err: any) {
        user.resetPasswordExpire = null
        user.resetPasswordToken = null
        await user.save({ validateBeforeSave: false })

        return next(new AppError(err.message, 500))
      }
    }
  )

  static resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex")

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      })

      if (!user)
        return next(new AppError("Token is invalid or has expired", 400))

      user.password = req.body.password
      user.resetPasswordExpire = null
      user.resetPasswordToken = null
      await user.save() // from here go to the middleware { this.passwordChnagedAt = Date.now() }

      sendToken(user, 200, res)
    }
  )

  static updatePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const password = req.body.password
      if (req.user === undefined) {
        return next(new AppError("Login to have access!", 404))
      }
      const user = await User.findById(req.user.id).select("+password")
      if (!user) {
        return next(new AppError("", 400))
      }

      const auth = await bcrypt.compare(password, user.password)
      if (!auth)
        return next(new AppError("The current password is not correct", 400))

      user.password = req.body.newPassword
      await user.save()
      /**
       * this save here does 2 things
       * 1. it encrypt the user password
       * 2. it updates the password changed at property to Date.now()
       * 3. it validates the user password in the model as well,
       *
       * that is why we are not making use of findByIdAndUpdate()
       *
       *  */

      sendToken(user, 200, res)
    }
  )

  static csrfToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {}
  )
}

export default AuthController
