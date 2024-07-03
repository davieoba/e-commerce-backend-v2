import Order from "../entity/order.entity"
import Product from "../entity/product.entity"
import User from "../entity/user.entity"
import catchAsync from "../extensions/libs/catch-async"
import AppError from "../extensions/libs/app-error"
import { NextFunction, Request, Response } from "express"

class OrderController {
  static createOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {}
  )
}

export default OrderController
