import Order from "../entity/order.entity"
import Product from "../entity/product.entity"
import User from "../entity/user.entity"
import catchAsync from "../extensions/libs/catch-async"
import AppError from "../extensions/libs/app-error"
import { NextFunction, Request, Response } from "express"
import { validateCreateOrderRequest } from "../extensions/schemas/order.schema"
import mongoose from "mongoose"

class OrderController {
  static createOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const response = validateCreateOrderRequest(req)
      if (!response.success && response.error) {
        return next(new AppError(response.error, 400))
      }

      const {
        orders,
        price,
        reference,
        shippingAddress,
        shippingPrice,
        taxPrice,
        userId,
      } = response.data!

      // Check product availability
      for (const order of orders) {
        const product = await Product.findById(order.id)
        if (!product || product.stock < 1 || product.stock < order.quantity) {
          return res.status(400).json({
            message:
              "The order could not be processed due to insufficient stock",
          })
        }
      }

      const populatedOrderItems = await Promise.all(
        orders.map(
          async (order: { id: string; quantity: number; price: number }) => {
            const product = await Product.findById(order.id)
            if (!product) {
              return next(
                new AppError(
                  "Order cannot be processed, product not found",
                  404
                )
              )
            }
            product.stock = product.stock - order.quantity
            await product.save()
            return {
              quantity: order.quantity,
              price: order.price,
              product: product._id,
              name: product.name,
              image: product.images[0].url,
            }
          }
        )
      )
      if (!req.user) return next(new AppError("User not found", 400))
      const order = await Order.create({
        shippingInfo: shippingAddress,
        user: req.user.id!,
        orderItems: populatedOrderItems,
        paymentInfo: {
          reference: reference,
          message: "Processing",
          transaction: "In Progress",
          status: "PENDING",
        },
        taxPrice,
        shippingPrice,
        totalPrice: price,
        paidAt: Date.now(),
        orderStatus: "Processing",
        deliveredAt: "",
        itemsPrice: price - shippingPrice,
      })
      const user = await User.findById(req.user.id)
      if (!user) return next(new AppError("User not found", 404))
      user.orders.push(order._id as mongoose.Types.ObjectId)
      // Remove the order from the user cart
      user.cart = user.cart.filter((item) => {
        orders.map((order) => {
          return order.id !== item.id
        })
      })
      await user.save({ validateBeforeSave: false })
      return res.status(200).json({
        message: "success",
        data: order,
      })
    }
  )
}

export default OrderController
