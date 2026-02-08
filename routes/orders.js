import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// CREATE - Create new order
router.post("/", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// READ - Get all orders with advanced filtering
router.get("/", async (req, res) => {
  try {
    const { 
      customer_email, 
      order_id, 
      status, 
      from_date, 
      to_date,
      limit = 50,
      skip = 0,
      sort = '-order_date'
    } = req.query;
    
    const query = {};

    if (customer_email) {
      query.customer_email = { $regex: customer_email, $options: 'i' };
    }
    if (order_id) {
      query.order_id = { $regex: order_id, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (from_date || to_date) {
      query.order_date = {};
      if (from_date) query.order_date.$gte = new Date(from_date);
      if (to_date) query.order_date.$lte = new Date(to_date);
    }

    const orders = await Order.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Order.countDocuments(query);

    res.json({ 
      success: true, 
      data: orders,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + orders.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// READ - Get single order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE - Update order
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE - Cancel order (soft delete by changing status)
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    
    if (!order.canBeCancelled()) {
      return res.status(400).json({ 
        success: false, 
        error: "Order cannot be cancelled in current status" 
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get order statistics
router.get("/stats/overview", async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" }
        }
      }
    ]);
    
    const totalOrders = await Order.countDocuments();
    
    res.json({ 
      success: true, 
      data: {
        totalOrders,
        byStatus: stats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
