import mongoose, { Document } from "mongoose"

export interface OrderDocument extends Document {
  shippingInfo: ShippingInfo
  user: typeof mongoose.Schema.Types.ObjectId
  orderItems: OrderItem[]
  paymentInfo: PaymentInfo
  taxPrice: number
  itemsPrice: number
  shippingPrice: number
  totalPrice: number
  paidAt: Date
  orderStatus: OrderStatus
}

interface ShippingInfo {
  firstName: string
  lastName: string
  country: string
  zipcode: string
  address: string
}

interface OrderItem {
  quantity: number
  price: number
  product: typeof mongoose.Schema.Types.ObjectId
  name: string
  image: string
}

interface PaymentInfo {
  status: string
  reference: string
  message: string
  transaction: string
}

type OrderStatus = "PROCESSING" | "DELIVERED" | "ON TRANSIT" | "IN PROGRESS"
