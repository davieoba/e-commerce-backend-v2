import mongoose, { Document } from "mongoose"

export interface OrderDocument extends Document {
  shippingInfo: ShippingInfo
  user: mongoose.Types.ObjectId
  orderItems: OrderItem[]
  paymentInfo: PaymentInfo
  taxPrice: number
  itemsPrice: number
  shippingPrice: number
  totalPrice: number
  paidAt: Date
  orderStatus: OrderStatus
  deliveredAt: Date
  createdAt: Date
  updated_at: Date
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
  product: mongoose.Types.ObjectId
  name: string
  image: string
}

interface PaymentInfo {
  status: string
  reference: string
  message: string
  transaction: string
}

// type OrderStatus = "PROCESSING" | "DELIVERED" | "ON TRANSIT" | "IN PROGRESS"
export enum OrderStatus {
  PROCESSING = "PROCESSING",
  DELIVERED = "DELIVERED",
  TRANSIT = "ON TRANSIT",
  IN_PROGRESS = "IN PROGRESS",
}
