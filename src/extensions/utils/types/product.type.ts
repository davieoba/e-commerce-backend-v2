import mongoose, { Document } from "mongoose"

export interface ProductDocument extends Document {
  name: string
  price: number
  description: string
  ratings: number
  images: ImageInterface[]
  category: ProductCategory
  seller: string
  stock: number
  numOfReviews: number
  reviews: (typeof mongoose.Schema.Types.ObjectId)[]
  user: typeof mongoose.Schema.Types.ObjectId
  createdAt: Date
  flashSale: boolean
  discount: number
  discountedPrice: number
  updated_at: Date
}

interface ImageInterface {
  public_id: string
  url: string
}

enum ProductCategory {
  Electronics = "Electronics",
  Cameras = "Cameras",
  Laptops = "Laptops",
  Accessories = "Accessories",
  Headphones = "Headphones",
  Books = "Books",
  Food = "Food",
  ClothesShoes = "Clothes/Shoes",
  BeautyHealth = "Beauty/Health",
  Sports = "Sports",
  Outdoor = "Outdoor",
  Home = "Home",
  TVWallMount = "TV Wall Mount",
  PortableSpeakers = "Portable Speakers",
  Watch = "Watch",
  MobilePhoneAccessories = "Mobile Phone Accessories",
  Glasses = "Glasses",
  Smartphones = "Smartphones",
  Televisions = "Televisions",
  Controllers = "Controllers",
  GamingConsoles = "Gaming Consoles",
  Tablets = "Tablets",
}
