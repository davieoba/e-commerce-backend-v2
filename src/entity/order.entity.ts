import mongoose, { Model, Schema } from "mongoose"
import { OrderDocument } from "../extensions/utils/types/order.type"

const orderSchema: Schema<OrderDocument> = new mongoose.Schema({})

const Order: Model<OrderDocument> = mongoose.model<OrderDocument>(
  "Order",
  orderSchema
)
export default Order
