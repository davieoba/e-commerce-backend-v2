import { NextFunction, Request, Response } from "express"
import Address from "../entity/address.entity"
import User from "../entity/user.entity"
import AppError from "../extensions/libs/app-error"
import catchAsync from "../extensions/libs/catch-async"
import { AddressDocument } from "../extensions/utils/types/address.type"

class ShippingController {
  static createShipping = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("Login to access resource", 401))
      const user = await User.findById(req.user.id)
      if (!user) {
        return next(new AppError("No user found, bad request", 400))
      }

      const shippingInfo = await Address.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipcode: req.body.zipcode,
        country: req.body.country,
        default: req.body.default || false,
      })
      if (!shippingInfo) {
        return next(new AppError("Error creating user shippingInfo", 401))
      }
      user.deliveryAddress.push(shippingInfo.id)
      await user.save({ validateBeforeSave: false })

      res.status(200).json({
        success: true,
        message: "Shipping Info created",
        shippingInfo,
      })
    }
  )

  static getDefaultShippingAddress = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) return next(new AppError("Login to access resource", 401))
      const user = await User.findById(req.user.id).populate("deliveryAddress")
      if (!user) {
        return next(new AppError("No user found, bad request", 400))
      }

      // send the latest updated document to the user
      const addresses = user.deliveryAddress as AddressDocument[]
      const defaultAddress = addresses.filter(
        (address) => address.default === true
      )
      res.status(200).json({
        address: defaultAddress,
      })
    }
  )

  static editShippingInfo = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const shippingAddress = req.params.id
      if (!req.user) return next(new AppError("Login to access resource", 401))
      const user = await User.findById(req.user.id)
      if (!user) {
        return next(new AppError("No user found, bad request", 400))
      }

      const doesTheUserHaveAddress = user.deliveryAddress.filter(
        (addressId) => {
          return String(addressId) === shippingAddress
        }
      )
      if (!doesTheUserHaveAddress) {
        return next(new AppError("Bad request", 400))
      }
      const shippingInfo = await Address.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      )
      if (!shippingInfo) {
        return next(new AppError("No shipping info found", 404))
      }
      res.status(200).json({
        message: "Shipping info updated",
        shippingInfo,
      })
    }
  )

  static getShippingInfo = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.params.id
      const user = await User.findById(id).populate("deliveryAddress")
      if (!user) {
        return next(new AppError("No user found", 404))
      }

      const shippingInfo = user.deliveryAddress
      res.status(200).json({
        message: "ok",
        address: shippingInfo,
      })
    }
  )

  static deleteShippingInfo = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const shippingAddressId = req.body.id
      if (!req.user) return next(new AppError("Login to access resource", 401))
      const user = await User.findById(req.user.id)
      if (!user) {
        return next(new AppError("No user found, bad request", 400))
      }
      const doesTheUserHaveAddress = user.deliveryAddress.filter(
        (addressId) => {
          return addressId === shippingAddressId
        }
      )
      if (!doesTheUserHaveAddress) {
        return next(new AppError("Bad request", 400))
      }
      // DELETE THE ADDRESS FROM THE ADDRESS DATABASE
      const shippingInfo = await Address.findByIdAndDelete(shippingAddressId)

      // DELETE THE ADDRESS FROM THE USER DATABASE COLLECTION
      await User.updateOne(
        { _id: user.id },
        { $pull: { deliveryAddress: { $in: [shippingAddressId] } } },
        { new: true }
      )
      await user.save({ validateBeforeSave: false })

      if (shippingInfo) {
        return res.status(200).json({
          message: "Deleted successfully",
        })
      }

      res.status(400).json({
        message: "Bad request",
      })
    }
  )
}

export default ShippingController
