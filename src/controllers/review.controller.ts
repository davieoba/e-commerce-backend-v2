import AppError from "../extensions/libs/app-error"
import Product from "../entity/product.entity"
import Review from "../entity/review.entity"
import User from "../entity/user.entity"
import catchAsync from "../extensions/libs/catch-async"
import { NextFunction, Request, Response } from "express"

class ReviewController {
  static createReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {}
  )
}
