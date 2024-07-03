import mongoose, { Model, Schema, Query } from "mongoose"
import validator from "validator"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserDocument } from "../extensions/utils/types/user.type"
import { JWT_EXPIRES, JWT_SECRET } from "../config/app.keys"
import crypto from "crypto"

const userSchema: Schema<UserDocument> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  googleId: String,
  email: {
    type: String,
    required: [true, "Please enter your email"],
    maxlength: 200,
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [5, "Password cannot be less than 5 characters"],
    select: false,
  },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/diggungrj/image/upload/v1668579345/avataaars_rkyikx.svg",
  },
  favorites: [String],
  cart: [
    {
      id: String,
      quantity: Number,
      price: Number,
      name: String,
      image: String,
      stock: String,
    },
  ],
  role: {
    type: String,
    enum: ["ADMIN", "USER"],
    default: "USER",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  passwordChangedAt: Date, // this property is created on the document object when the user changes their password
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  deliveryAddress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  updated_at: {
    type: Date,
    default: Date.now,
  },
})

userSchema.pre("save", async function (next) {
  // if the password is not modified then I dont't have to encrypt it
  if (!this.isModified("password")) {
    return next()
  }

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next()
  /**
   * if isModified is true then continue running the code
   * isNew means is the document new
   * if the password has not been modified then( !false = true) || isNew = true
   *
   * exit the function (if the password has not been modified or the document is new )
   */

  /**
   * some times the token would be issued to the user before the passwordChangedAt property is saved to the DB, so this code here is to make sure that atleast 1.5seconds is subtracted from the passwordChangedAt time because if the jwt < passwordChangedAt then it means that the user changed the password after the token was issued
   * */
  this.passwordChangedAt = new Date(Date.now() - 1500)
  next()
})

// /^find/ means that any query that starts with find
userSchema.pre<Query<UserDocument, UserDocument>>(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, String(JWT_SECRET), {
    expiresIn: JWT_EXPIRES,
  })
}

userSchema.methods.comparePassword = async function (password: string) {
  const auth = await bcrypt.compare(password, this.password)

  return auth
}

// check if the user changed thier password after the token was issued
userSchema.methods.changedPasswordAfter = function (JwtTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000)
    // logger.info(JwtTimestamp, changedTimestamp)
    return JwtTimestamp < changedTimestamp
  }

  return false
}

// generate password reset tokenGeneric type 'Query<ResultType, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods>' requires between 2 and 6 type arguments.
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex")

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

  return resetToken
}

const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema
)
export default User
