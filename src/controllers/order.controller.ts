import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import Order from "../entity/order.entity"
import Product from "../entity/product.entity"
import User from "../entity/user.entity"
import AppError from "../extensions/libs/app-error"
import catchAsync from "../extensions/libs/catch-async"
import { validateCreateOrderRequest } from "../extensions/schemas/order.schema"

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

  static getOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
      )
      if (!order) return next(new AppError("No order found with this id", 404))
      res.status(200).json({
        message: "success",
        data: {
          order,
        },
      })
    }
  )

  static getMyOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("User not found", 404))
      const order = await Order.find({ user: req.user.id })

      res.status(200).json({
        message: "success",
        data: {
          order,
        },
      })
    }
  )

  static getAllOrders = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const orders = await Order.find()
        .populate("orderItems.product")
        .populate("user")

      let totalAmount = 0

      orders.forEach((order) => {
        totalAmount += order.totalPrice
      })

      res.status(200).json({
        message: "success",
        length: orders.length,
        data: {
          orders,
          totalAmount,
        },
      })
    }
  )

  static updateOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.params.id
      const order = await Order.findById(id)
      if (!order) return next(new AppError("No Order found", 404))
      if (order.orderStatus === "DELIVERED") {
        return next(new AppError("Order cannot be changed", 400))
      }

      order.orderItems.forEach(async (item) => {
        await OrderController.updateStock(item.product, item.quantity)
      })
      order.orderStatus = req.body.status
      order.deliveredAt = new Date(Date.now())
      await order.save()

      res.status(200).json({
        message: "success",
      })
    }
  )

  static async updateStock(id: mongoose.Types.ObjectId, quantity: number) {
    const product = await Product.findById(id)
    if (!product) return
    product.stock = product?.stock - quantity
    await product?.save({ validateBeforeSave: false })
  }
}

export default OrderController
