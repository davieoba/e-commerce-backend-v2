import mongoose, { Model, Schema } from "mongoose"
import {
  OrderDocument,
  OrderStatus,
} from "../extensions/utils/types/order.type"

const orderSchema: Schema<OrderDocument> = new mongoose.Schema({
  shippingInfo: {
    firstname: String,
    lastname: String,
    country: String,
    zipcode: String,
    address: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  orderItems: [
    {
      quantity: {
        type: Number,
        // required: true,
      },
      price: {
        type: Number,
        // required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      name: String,
      image: String,
    },
  ],
  paymentInfo: {
    status: String,
    reference: String,
    message: String,
    transaction: String,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  itemsPrice: {
    type: Number,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  paidAt: {
    type: Date,
  },
  orderStatus: {
    type: String,
    required: true,
    default: OrderStatus.PROCESSING,
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
})

const Order: Model<OrderDocument> = mongoose.model<OrderDocument>(
  "Order",
  orderSchema
)
export default Order
