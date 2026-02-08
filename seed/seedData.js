import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config();

// Import models
const OrderSchema = new mongoose.Schema({
  order_id: String,
  customer_email: String,
  status: String,
  items: [String],
  shipping_address: String,
  order_date: Date,
  tracking_number: String,
  estimated_delivery: Date,
  total_amount: Number
}, { timestamps: true });

const KnowledgeBaseSchema = new mongoose.Schema({
  category: String,
  title: String,
  content: String,
  keywords: [String],
  priority: Number,
  views: Number,
  helpful_count: Number
}, { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);
const KnowledgeBase = mongoose.model("KnowledgeBase", KnowledgeBaseSchema);

// Book titles for realistic e-commerce
const bookTitles = [
  "The Great Gatsby",
  "To Kill a Mockingbird",
  "1984",
  "Pride and Prejudice",
  "The Catcher in the Rye",
  "Harry Potter and the Sorcerer's Stone",
  "The Lord of the Rings",
  "Animal Farm",
  "Brave New World",
  "The Hobbit",
  "Fahrenheit 451",
  "Jane Eyre",
  "Wuthering Heights",
  "The Odyssey",
  "Moby Dick"
];

// Generate realistic orders
function generateOrders(count = 100) {
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const orders = [];

  for (let i = 0; i < count; i++) {
    const orderDate = faker.date.past({ years: 1 });
    const status = faker.helpers.arrayElement(statuses);
    
    const order = {
      order_id: `ORD-${faker.number.int({ min: 10000, max: 99999 })}`,
      customer_email: faker.internet.email().toLowerCase(),
      status,
      items: faker.helpers.arrayElements(bookTitles, { min: 1, max: 4 }),
      shipping_address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
      order_date: orderDate,
      tracking_number: ['shipped', 'delivered'].includes(status) 
        ? `TRK${faker.string.alphanumeric(10).toUpperCase()}` 
        : null,
      estimated_delivery: status !== 'cancelled' 
        ? faker.date.future({ refDate: orderDate })
        : null,
      total_amount: faker.number.float({ min: 15.99, max: 199.99, precision: 0.01 })
    };

    orders.push(order);
  }

  return orders;
}

// Comprehensive knowledge base entries
const knowledgeBaseEntries = [
  {
    category: "shipping",
    title: "Standard Shipping Times",
    content: "Standard shipping typically takes 5-7 business days within the continental United States. Orders are processed within 1-2 business days. You'll receive a tracking number via email once your order ships.",
    keywords: ["shipping", "delivery", "standard", "time", "days"],
    priority: 8,
    views: 0,
    helpful_count: 0
  },
  {
    category: "shipping",
    title: "Express Shipping Options",
    content: "Express shipping is available for 2-3 business day delivery. This option can be selected at checkout for an additional fee. Express orders placed before 2 PM EST ship the same day.",
    keywords: ["express", "fast", "shipping", "quick", "2-day", "3-day"],
    priority: 7,
    views: 0,
    helpful_count: 0
  },
  {
    category: "shipping",
    title: "International Shipping",
    content: "We ship to over 50 countries worldwide. International shipping takes 10-21 business days depending on destination. Customs fees and import duties are the responsibility of the customer.",
    keywords: ["international", "overseas", "worldwide", "global", "shipping"],
    priority: 5,
    views: 0,
    helpful_count: 0
  },
  {
    category: "returns",
    title: "Return Policy Overview",
    content: "Items can be returned within 30 days of delivery if they are in original condition with all packaging intact. Books must be unread and unmarked. Return shipping is free for defective items, otherwise customers pay return shipping costs.",
    keywords: ["return", "refund", "policy", "30 days", "money back"],
    priority: 9,
    views: 0,
    helpful_count: 0
  },
  {
    category: "returns",
    title: "How to Initiate a Return",
    content: "To start a return: 1) Log into your account, 2) Go to Order History, 3) Select the order, 4) Click 'Request Return', 5) Print the return label, 6) Ship within 5 days. Refunds are processed within 5-7 business days of receiving the return.",
    keywords: ["return", "how to", "process", "steps", "initiate"],
    priority: 8,
    views: 0,
    helpful_count: 0
  },
  {
    category: "returns",
    title: "Damaged or Defective Items",
    content: "If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos. We'll arrange a free return pickup and send a replacement or issue a full refund immediately.",
    keywords: ["damaged", "defective", "broken", "quality", "problem"],
    priority: 10,
    views: 0,
    helpful_count: 0
  },
  {
    category: "account",
    title: "Password Reset Instructions",
    content: "To reset your password: 1) Visit bookly.com/reset-password, 2) Enter your email address, 3) Check your email for a reset link (check spam folder if not found), 4) Click the link and create a new password. Links expire after 24 hours.",
    keywords: ["password", "reset", "forgot", "login", "access"],
    priority: 9,
    views: 0,
    helpful_count: 0
  },
  {
    category: "account",
    title: "Update Account Information",
    content: "You can update your email, shipping address, payment methods, and preferences by logging into your account and navigating to 'Account Settings'. Changes are saved automatically.",
    keywords: ["account", "update", "change", "edit", "profile", "settings"],
    priority: 6,
    views: 0,
    helpful_count: 0
  },
  {
    category: "account",
    title: "Email Preferences and Notifications",
    content: "Manage your email preferences in Account Settings > Notifications. You can opt in/out of marketing emails, order updates, and promotional offers. Order confirmation and shipping notifications cannot be disabled.",
    keywords: ["email", "notifications", "preferences", "unsubscribe", "marketing"],
    priority: 5,
    views: 0,
    helpful_count: 0
  },
  {
    category: "payment",
    title: "Accepted Payment Methods",
    content: "We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, and Google Pay. All transactions are encrypted and secure. We do not store full credit card numbers.",
    keywords: ["payment", "credit card", "paypal", "pay", "methods"],
    priority: 7,
    views: 0,
    helpful_count: 0
  },
  {
    category: "payment",
    title: "Payment Declined Issues",
    content: "If your payment is declined: 1) Verify card details are correct, 2) Ensure sufficient funds, 3) Check with your bank about international transaction blocks, 4) Try a different payment method. Contact us if the issue persists.",
    keywords: ["payment", "declined", "failed", "error", "card", "problem"],
    priority: 8,
    views: 0,
    helpful_count: 0
  },
  {
    category: "payment",
    title: "Refund Processing Time",
    content: "Refunds are issued to the original payment method within 5-7 business days after we receive your return. Credit card refunds may take an additional 3-5 business days to appear on your statement depending on your bank.",
    keywords: ["refund", "money", "time", "how long", "processing"],
    priority: 7,
    views: 0,
    helpful_count: 0
  },
  {
    category: "products",
    title: "Book Condition Definitions",
    content: "New: Brand new, unread. Like New: Minimal shelf wear, appears unread. Very Good: Minor wear, clean pages. Good: Obvious wear but fully readable. Acceptable: Heavy wear but complete and readable.",
    keywords: ["condition", "quality", "new", "used", "book"],
    priority: 6,
    views: 0,
    helpful_count: 0
  },
  {
    category: "products",
    title: "Out of Stock Items",
    content: "If an item is out of stock, you can sign up for restock notifications on the product page. We'll email you when it's available again. Most items are restocked within 2-4 weeks.",
    keywords: ["out of stock", "unavailable", "restock", "notify", "availability"],
    priority: 7,
    views: 0,
    helpful_count: 0
  },
  {
    category: "general",
    title: "Customer Service Hours",
    content: "Our customer service team is available Monday-Friday, 9 AM - 6 PM EST. Email support is available 24/7 and we respond within 24 hours. For urgent issues, call 1-800-BOOKLY during business hours.",
    keywords: ["contact", "support", "hours", "phone", "email", "help"],
    priority: 8,
    views: 0,
    helpful_count: 0
  },
  {
    category: "general",
    title: "Order Tracking Information",
    content: "Track your order using the tracking number in your shipping confirmation email. Visit our Track Order page or click the tracking link in the email. Tracking updates may take 24-48 hours after shipping to appear.",
    keywords: ["track", "tracking", "status", "where", "order", "shipment"],
    priority: 9,
    views: 0,
    helpful_count: 0
  },
  {
    category: "general",
    title: "Gift Orders and Gift Wrapping",
    content: "We offer gift wrapping for $4.99 per item. You can also include a gift message and hide prices on the packing slip. Select these options at checkout under 'Gift Options'.",
    keywords: ["gift", "wrapping", "present", "message", "special"],
    priority: 5,
    views: 0,
    helpful_count: 0
  }
];

async function seed() {
  try {
    console.log("📌 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected successfully");

    console.log("🧹 Clearing existing data...");
    await Order.deleteMany({});
    await KnowledgeBase.deleteMany({});

    console.log("📦 Creating 100 realistic orders...");
    const orders = generateOrders(100);
    await Order.insertMany(orders);
    console.log(`✅ Created ${orders.length} orders`);

    console.log("📚 Creating knowledge base entries...");
    await KnowledgeBase.insertMany(knowledgeBaseEntries);
    console.log(`✅ Created ${knowledgeBaseEntries.length} knowledge articles`);

    // Create text index for knowledge base search
    try {
      await KnowledgeBase.collection.createIndex({ 
        title: "text", 
        content: "text", 
        keywords: "text" 
      });
      console.log("✅ Created text search index");
    } catch (error) {
      console.log("ℹ️  Text index may already exist");
    }

    console.log("\n🎉 Seeding completed successfully!");
    console.log("\nSample data created:");
    console.log(`- ${orders.length} orders`);
    console.log(`- ${knowledgeBaseEntries.length} knowledge base articles`);
    console.log(`- Categories: shipping, returns, account, payment, products, general`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
