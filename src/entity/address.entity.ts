import mongoose, { Model, Schema } from "mongoose"
import { AddressDocument } from "../extensions/utils/types/address.type"
import { NextFunction } from "express"

const addressSchema: Schema<AddressDocument> = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  zipcode: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  default: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
})

addressSchema.pre("save", async function (next) {
  this.updated_at = new Date(Date.now())
  next()
})
const Address: Model<AddressDocument> = mongoose.model<AddressDocument>(
  "Address",
  addressSchema
)
export default Address
