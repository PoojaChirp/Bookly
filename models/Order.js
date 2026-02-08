import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer_email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  items: [{
    type: String,
    required: true
  }],
  shipping_address: {
    type: String,
    required: true
  },
  order_date: {
    type: Date,
    default: Date.now,
    index: true
  },
  tracking_number: {
    type: String,
    sparse: true
  },
  estimated_delivery: Date,
  total_amount: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
OrderSchema.index({ customer_email: 1, order_date: -1 });
OrderSchema.index({ status: 1, order_date: -1 });

// Methods
OrderSchema.methods.canBeCancelled = function() {
  return ['pending', 'processing'].includes(this.status);
};

export default mongoose.model("Order", OrderSchema);
