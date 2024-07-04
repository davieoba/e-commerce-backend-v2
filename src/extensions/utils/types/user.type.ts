import mongoose, { Document, mongo } from "mongoose"
import { AddressDocument } from "./address.type"

export interface UserDocument extends Document {
  firstName: string
  lastName: string
  googleId: string
  email: string
  password: string
  avatar: string
  favorites: string[]
  cart: Cart[]
  createdAt: Date
  resetPasswordToken: string | null
  role: UserRoleEnum
  resetPasswordExpire: Date | null
  passwordChangedAt: Date
  active: boolean
  refreshToken: string
  deliveryAddress: mongoose.Types.ObjectId[] | AddressDocument[]
  orders: mongoose.Types.ObjectId[]
  reviews: mongoose.Types.ObjectId[]
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

// type role = "ADMIN" | "USER"
export enum UserRoleEnum {
  ADMIN = "ADMIN",
  USER = "USER",
  GUEST = "GUEST",
  STAFF = "STAFF",
  RIDER = "RIDER",
}
