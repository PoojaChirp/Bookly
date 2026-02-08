import mongoose from "mongoose";

const KnowledgeBaseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['shipping', 'returns', 'payment', 'account', 'products', 'general'],
    index: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  keywords: [{
    type: String,
    lowercase: true
  }],
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  views: {
    type: Number,
    default: 0
  },
  helpful_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Text index for search
KnowledgeBaseSchema.index({ 
  title: 'text', 
  content: 'text', 
  keywords: 'text' 
});

// Methods
KnowledgeBaseSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

KnowledgeBaseSchema.methods.markHelpful = function() {
  this.helpful_count += 1;
  return this.save();
};

export default mongoose.model("KnowledgeBase", KnowledgeBaseSchema);
