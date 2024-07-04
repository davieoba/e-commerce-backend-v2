import mongoose, { Model, Schema } from "mongoose"
import { ProductDocument } from "../extensions/utils/types/product.type"

const productSchema: Schema<ProductDocument> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxLength: [300, "Product name must not exceed 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
    default: 0.0,
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please select product category"],
    enum: {
      values: [
        "Electronics",
        "Cameras",
        "Laptops",
        "Accessories",
        "Headphones",
        "Books",
        "Food",
        "Clothes/Shoes",
        "Beauty/Health",
        "Sports",
        "Outdoor",
        "Home",
        "TV Wall Mount",
        "Portable Speakers",
        "Watch",
        "Mobile Phone Accessories",
        "Glasses",
        "Smartphones",
        "Televisions",
        "Controllers",
        "Gaming Consoles",
        "Tablets",
      ],
      message: "Please select category for product",
    },
  },
  seller: {
    type: String,
    required: [true, "Please enter a seller"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter stock"],
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "The user who created the product is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  flashSale: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    default: 0,
  },
  discountedPrice: {
    type: Number,
    default: 0,
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
})

productSchema.pre("save", async function (next) {
  this.updated_at = new Date(Date.now())
  next()
})

const Product: Model<ProductDocument> = mongoose.model<ProductDocument>(
  "Product",
  productSchema
)
export default Product
