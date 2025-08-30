// models/Cart.ts
import mongoose, { Schema } from 'mongoose';

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
});

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  items: [CartItemSchema],
});

export default mongoose.model('Cart', CartSchema);
