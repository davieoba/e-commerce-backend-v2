import mongoose, { Model, Schema } from "mongoose"
import { ReviewDocument } from "../extensions/utils/types/review.type"

const reviewSchema: Schema<ReviewDocument> = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rating: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  review: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
})

reviewSchema.pre("save", async function (next) {
  this.updated_at = new Date(Date.now())
  next()
})

const Review: Model<ReviewDocument> = mongoose.model<ReviewDocument>(
  "Review",
  reviewSchema
)

export default Review
