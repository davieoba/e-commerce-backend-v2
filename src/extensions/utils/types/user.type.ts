import mongoose, { Document, mongo } from "mongoose"

export interface UserDocument extends Document {
  name: string
  googleId: string
  email: string
  password: string
  avatar: string
  favorites: string[]
  cart: Cart[]
  createdAt: Date
  resetPasswordToken: string | null
  role: role
  resetPasswordExpire: Date | null
  passwordChangedAt: Date
  active: boolean
  refreshToken: string
  deliveryAddress: (typeof mongoose.Schema.Types.ObjectId)[]
  orders: (typeof mongoose.Schema.Types.ObjectId)[]
  reviews: (typeof mongoose.Schema.Types.ObjectId)[]
  updated_at: Date
  getJWTToken: () => string
  comparePassword: (password: string) => boolean
  changedPasswordAfter: (JwtTimestamp: number) => boolean
  generatePasswordResetToken: () => string
}

interface Cart {
  id: string
  quantity: number
  price: number
  name: string
  image: string
  stock: string
}

type role = "ADMIN" | "USER"
