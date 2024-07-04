import { Request } from "express"
import joi from "joi"

interface ValidationResult {
  success: boolean
  error?: string
  data?: {
    orders: { id: string; quantity: number; price: number }[]
    reference: string
    userId: string
    shippingAddress: string
    price: number
    shippingPrice: number
    taxPrice: number
  }
}

export const createOrderSchema = joi.object({
  orders: joi
    .array()
    .items(
      joi.object({
        id: joi.string().required(),
        quantity: joi.number().integer().min(1).required(),
        price: joi.number().required(),
      })
    )
    .required(),
  reference: joi.string().required(),
  userId: joi.string().required(),
  shippingAddress: joi
    .object({
      street: joi.string().required(),
      city: joi.string().required(),
      state: joi.string().required(),
      zipCode: joi.string().required(),
      country: joi.string().required(),
    })
    .required(),
  price: joi.number().required(),
  shippingPrice: joi.number().required(),
  taxPrice: joi.number().required(),
})

export const validateCreateOrderRequest = (req: Request): ValidationResult => {
  const { error, value } = createOrderSchema.validate(req.body, {
    abortEarly: false,
  })
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
    data: {
      orders: value.orders,
      reference: value.reference,
      userId: value.userId,
      shippingAddress: value.shippingAddress,
      price: value.price,
      shippingPrice: value.shippingPrice,
      taxPrice: value.taxPrice,
    },
  }
}
