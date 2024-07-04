import { Request } from "express"
import * as joi from "joi"

interface ValidationResult {
  success: boolean
  error?: string
  data?: {
    subject: string
    user: string
    rating: number
    product: string
    userReview: string
  }
}

const reviewSchema = joi.object({
  subject: joi.string().required(),
  user: joi.string().required(),
  rating: joi.number().required(),
  product: joi.string().required(),
  userReview: joi.string().required(),
})

export const validateReviewSchema = (req: Request): ValidationResult => {
  const { error, value } = reviewSchema.validate(req.body)
  if (error) {
    return {
      success: false,
      error: `Validation error: ${error.details
        .map((x) => x.message)
        .join(", ")}`,
    }
  }

  return {
    success: true,
    data: value,
  }
}

export default reviewSchema
