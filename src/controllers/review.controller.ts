import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import Product from "../entity/product.entity"
import Review from "../entity/review.entity"
import User from "../entity/user.entity"
import AppError from "../extensions/libs/app-error"
import catchAsync from "../extensions/libs/catch-async"
import { validateReviewSchema } from "../extensions/schemas/review.schema"

class ReviewController {
  static createReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { error, success, data } = validateReviewSchema(req)
      if (error && !success) {
        return next(new AppError(error, 400))
      }

      if (!req.user) {
        return next(new AppError("User not found, Login!", 404))
      }

      const { productId, rating, subject, userReview } = data!
      const review = await Review.create({
        subject: subject,
        user: req.user.id,
        rating: rating,
        product: productId,
        review: userReview,
      })
      const product = await Product.findById(productId)
      if (!product) return next(new AppError("Error, product not found", 404))
      product.reviews.push(review._id as mongoose.Types.ObjectId)
      await product.save({ validateBeforeSave: false })

      const user = await User.findById(req.user.id)
      if (!user) return next(new AppError("Error, user not found", 400))
      user.reviews.push(review._id as mongoose.Types.ObjectId)
      await user.save({ validateBeforeSave: false })

      return res.status(200).json({
        message: "success",
        data: review,
      })
    }
  )

  static getAllReviews = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const reviews = await Review.find()
      res.status(200).json({
        message: "success",
        data: reviews,
      })
    }
  )

  static getProductReviews = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const productId = req.params.id
      const product = await Product.findById(productId)
        .populate({
          path: "reviews",
          populate: {
            path: "user",
            model: "User",
          },
        })
        .exec()

      return res.status(200).json({
        message: "succces",
        data: product,
      })
    }
  )
}

export default ReviewController
