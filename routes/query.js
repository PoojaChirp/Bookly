import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Order from "../models/Order.js";
import KnowledgeBase from "../models/KnowledgeBase.js";

const router = express.Router();

// Helper function to get Gemini client (lazy initialization)
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper function to extract email from query
function extractEmail(query) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = query.match(emailRegex);
  return match ? match[0] : null;
}

// Helper function to extract order ID
function extractOrderId(query) {
  const orderIdRegex = /\b(ORD-\d+)\b/i;
  const match = query.match(orderIdRegex);
  return match ? match[1].toUpperCase() : null;
}

// Helper function to determine query intent
function analyzeIntent(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('order') && (lowerQuery.includes('status') || lowerQuery.includes('where') || lowerQuery.includes('track'))) {
    return 'order_status';
  }
  if (lowerQuery.includes('cancel') && lowerQuery.includes('order')) {
    return 'cancel_order';
  }
  if (lowerQuery.includes('return') || lowerQuery.includes('refund')) {
    return 'returns';
  }
  if (lowerQuery.includes('ship') || lowerQuery.includes('deliver')) {
    return 'shipping';
  }
  if (lowerQuery.includes('password') || lowerQuery.includes('reset') || lowerQuery.includes('login')) {
    return 'account';
  }
  
  return 'general';
}

// Main query endpoint
router.post("/", async (req, res) => {
  try {
    // Check API key at runtime
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      return res.status(500).json({ 
        success: false, 
        error: "Server configuration error: GEMINI_API_KEY not set" 
      });
    }

    const userQuery = req.body.query;

    if (!userQuery) {
      return res.status(400).json({ 
        success: false, 
        error: "Query is required" 
      });
    }

    console.log(`Processing query: "${userQuery}"`);

    // Analyze query intent
    const intent = analyzeIntent(userQuery);
    console.log(`Detected intent: ${intent}`);

    let orderData = null;
    let knowledgeContext = [];
    const toolsUsed = [];

    // Extract identifiers
    const email = extractEmail(userQuery);
    const orderId = extractOrderId(userQuery);

    // If order-related query, try to fetch order data
    if (intent === 'order_status' || intent === 'cancel_order') {
      if (orderId) {
        orderData = await Order.findOne({ order_id: orderId });
        if (orderData) {
          toolsUsed.push('MongoDB:OrderLookup');
          console.log(`Found order: ${orderId}`);
        }
      } else if (email) {
        const orders = await Order.find({ customer_email: email })
          .sort({ order_date: -1 })
          .limit(3);
        if (orders.length > 0) {
          orderData = orders;
          toolsUsed.push('MongoDB:OrderSearch');
          console.log(`Found ${orders.length} orders for ${email}`);
        }
      }
    }

    // Search knowledge base for relevant information
    const keywords = userQuery.split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5);
    
    if (keywords.length > 0) {
      try {
        const searchQuery = keywords.join(' ');
        knowledgeContext = await KnowledgeBase.find({
          $text: { $search: searchQuery }
        }, {
          score: { $meta: "textScore" }
        })
          .sort({ score: { $meta: "textScore" } })
          .limit(3);
        
        if (knowledgeContext.length > 0) {
          toolsUsed.push('MongoDB:KnowledgeSearch');
          console.log(`Found ${knowledgeContext.length} knowledge articles`);
        }
      } catch (error) {
        console.log('Text search not available, using regex fallback');
        const searchConditions = keywords.map(keyword => ({
          $or: [
            { content: { $regex: keyword, $options: "i" } },
            { title: { $regex: keyword, $options: "i" } }
          ]
        }));
        
        knowledgeContext = await KnowledgeBase.find({
          $or: searchConditions
        }).limit(3);
        
        if (knowledgeContext.length > 0) {
          toolsUsed.push('MongoDB:KnowledgeRegexSearch');
        }
      }
    }

    // Build context for LLM
    let context = "You are Bookly's helpful customer support agent. ";
    
    if (orderData) {
      if (Array.isArray(orderData)) {
        context += "\n\nRECENT ORDERS FOR CUSTOMER:\n";
        orderData.forEach(order => {
          context += `- Order ${order.order_id}: ${order.status}, ordered on ${order.order_date.toDateString()}`;
          if (order.tracking_number) {
            context += `, tracking: ${order.tracking_number}`;
          }
          context += `\n`;
        });
      } else {
        context += `\n\nORDER DETAILS:\n`;
        context += `Order ID: ${orderData.order_id}\n`;
        context += `Status: ${orderData.status}\n`;
        context += `Items: ${orderData.items.join(', ')}\n`;
        context += `Order Date: ${orderData.order_date.toDateString()}\n`;
        if (orderData.tracking_number) {
          context += `Tracking Number: ${orderData.tracking_number}\n`;
        }
        if (orderData.estimated_delivery) {
          context += `Estimated Delivery: ${orderData.estimated_delivery.toDateString()}\n`;
        }
        context += `Shipping Address: ${orderData.shipping_address}\n`;
      }
    }

    if (knowledgeContext.length > 0) {
      context += "\n\nRELEVANT KNOWLEDGE BASE:\n";
      knowledgeContext.forEach(kb => {
        context += `\n[${kb.category.toUpperCase()}] ${kb.title}\n${kb.content}\n`;
      });
    }

    if (!orderData && knowledgeContext.length === 0) {
      context += "\n\nNo specific order or knowledge base information found. ";
      context += "Provide a helpful general response based on common e-commerce support practices.";
    }

    // Generate response using Gemini
    toolsUsed.push('Gemini:2.5-Flash');
    
    console.log('🤖 Calling Gemini API...');
    const genAI = getGeminiClient(); // Create client with current env var
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `${context}

USER QUESTION: ${userQuery}

Provide a helpful, concise, and friendly response. If order information is provided, reference specific details. 
Be professional but conversational. If you don't have enough information, politely ask for more details.
Do not mention that you're using a knowledge base or database - just provide the information naturally.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log('✅ Gemini response received');

    console.log(`Response generated using: ${toolsUsed.join(', ')}`);

    res.json({ 
      success: true,
      response,
      tools_used: toolsUsed,
      intent,
      metadata: {
        found_orders: orderData ? (Array.isArray(orderData) ? orderData.length : 1) : 0,
        found_knowledge: knowledgeContext.length
      }
    });

  } catch (error) {
    console.error("Error during query processing:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error during query processing",
      details: error.message 
    });
  }
});

// Feedback endpoint
router.post("/feedback", async (req, res) => {
  try {
    const { helpful, knowledge_id } = req.body;
    
    if (helpful && knowledge_id) {
      const kb = await KnowledgeBase.findById(knowledge_id);
      if (kb) {
        await kb.markHelpful();
      }
    }
    
    res.json({ success: true, message: "Feedback recorded" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;