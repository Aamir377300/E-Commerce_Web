import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Product extends Document {
  seller: Types.ObjectId;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<Product> = new Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    stock: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<Product>('Product', ProductSchema);
