import express from "express";
import Order from "../models/Order.js";
import KnowledgeBase from "../models/KnowledgeBase.js";

const router = express.Router();

// Get dashboard analytics
router.get("/dashboard", async (req, res) => {
  try {
    // Order statistics
    const totalOrders = await Order.countDocuments();
    
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ order_date: -1 })
      .limit(5)
      .select('order_id customer_email status order_date');

    // Orders trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersTrend = await Order.aggregate([
      {
        $match: {
          order_date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$order_date" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Knowledge base statistics
    const totalKnowledge = await KnowledgeBase.countDocuments();
    
    const knowledgeByCategory = await KnowledgeBase.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" }
        }
      }
    ]);

    const topKnowledge = await KnowledgeBase.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title category views helpful_count');

    res.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus,
          recent: recentOrders,
          trend: ordersTrend
        },
        knowledge: {
          total: totalKnowledge,
          byCategory: knowledgeByCategory,
          topArticles: topKnowledge
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get customer analytics
router.get("/customers", async (req, res) => {
  try {
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$customer_email",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total_amount" },
          lastOrder: { $max: "$order_date" }
        }
      },
      {
        $sort: { orderCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: topCustomers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
