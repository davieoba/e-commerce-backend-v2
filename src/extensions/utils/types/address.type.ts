import mongoose, { Document } from "mongoose"

export interface AddressDocument extends Document {
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  zipcode: string
  country: string
  user: mongoose.Types.ObjectId
  default: boolean
  createdAt: Date
  updated_at: Date
}
