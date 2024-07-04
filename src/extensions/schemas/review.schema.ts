import { Request } from "express"
import joi from "joi"

interface ValidationResult {
  success: boolean
  error?: string
  data?: {
    subject: string
    rating: number
    productId: string
    userReview: string
  }
}

const reviewSchema = joi.object({
  subject: joi.string().required(),
  rating: joi.number().required(),
  productId: joi.string().required(),
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
