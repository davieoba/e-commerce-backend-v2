import { NextFunction, Request, Response } from "express"
import Product from "../entity/product.entity"
import User from "../entity/user.entity"
import AppError from "../extensions/libs/app-error"
import catchAsync from "../extensions/libs/catch-async"

class UserController {
  static getUsers = catchAsync(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const user = await User.find()

      res.status(200).json({
        message: "ok",
        length: user.length,
        data: { user },
      })
    }
  )

  static getMe = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const user = req.user

      res.status(200).json({
        message: "ok",
        data: user,
      })
    }
  )

  static getProfile = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const id = req.params.id
      const user = await User.findById(id)
      res.status(200).json({
        message: "profile found",
        user,
      })
    }
  )

  static getUser = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const id = req.params.id
      const user = await User.findById(id).populate("deliveryAddress")

      res.status(200).json({
        message: "success",
        // user,
      })
    }
  )

  static updateMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.body.password) {
        return next(new AppError("Wrong route for updating password", 401))
      }
      const notAllowedObj = ["role", "password", "avatar", "createdAt"]
      const obj = { ...req.body }
      notAllowedObj.forEach((el) => {
        return delete obj[el]
      })

      if (!req.user) return next(new AppError("Login to access resource", 401))
      const user = await User.findByIdAndUpdate(req.user.id, obj, {
        new: true,
        runValidators: true,
      }).populate("deliveryAddress")

      res.status(200).json({
        message: "ok",
        user,
      })
    }
  )

  static deleteMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("Login to access resource", 401))
      await User.findByIdAndUpdate(
        req.user.id,
        { active: false },
        {
          new: true,
        }
      )
      res.status(204).json({
        message: "ok",
        data: null,
      })
    }
  )

  static wishlistProducts = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("Login to access resource", 401))
      const id = req.user._id
      const user = await User.findById(id)

      if (!user) return next(new AppError("Login to access resource", 401))
      return res.status(200).json({
        message: "success",
        data: user.favorites,
      })
    }
  )

  static populateWishlistProducts = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("Login to access resource", 401))
      const id = req.user._id
      const user = await User.findById(id)
      if (!user) return next(new AppError("Login to access resource", 401))
      const products = await Promise.all(
        user.favorites.map(async (productId) => {
          const query = await Product.findById(productId)
          if (!query) return next(new AppError("Product not found", 404))
          return {
            name: query?.name,
            images: query?.images,
            price: query?.price,
            ratings: query?.ratings,
            _id: query?._id,
            discount: query?.discount,
            discountedPrice: query?.price * (query?.discount / 100),
          }
        })
      )

      res.status(200).json({
        message: "success",
        data: products,
      })
    }
  )

  static cart = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("Login to access resource", 401))
      const id = req.user._id
      const user = await User.findById(id)
      if (!user) return next(new AppError("Login to access resource", 401))
      // POPULATE THE CART ITEMS
      const productIds = user.cart.map((item) => item.id)
      const products = await Product.find({ _id: { $in: productIds } })

      // ADD THE PRODUCT QUANTITY INSIDE THE PRODUCT
      const response = products.map((product, index) => {
        return {
          _id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          ratings: product.ratings,
          images: product.images,
          category: product.category,
          seller: product.seller,
          stock: product.stock,
          numOfReviews: product.numOfReviews,
          reviews: product.reviews,
          user: product.user,
          flashSale: product.flashSale,
          createdAt: product.createdAt,
          quantity: user.cart[index].quantity,
        }
      })

      res.status(200).json({
        message: "success",
        data: user.cart,
        products: response,
      })
    }
  )
}

export default UserController
