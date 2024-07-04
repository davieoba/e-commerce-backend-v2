import mongoose, { Document } from "mongoose"

export interface ReviewDocument extends Document {
  subject: string
  user: mongoose.Types.ObjectId
  rating: number
  product: mongoose.Types.ObjectId
  review: string
  createdAt: Date
  updated_at: Date
}
