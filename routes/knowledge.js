import express from 'express';
import KnowledgeBase from '../models/KnowledgeBase.js';

const router = express.Router();

// CREATE
router.post('/', async (req, res) => {
  try {
    const knowledge = await KnowledgeBase.create(req.body);
    res.status(201).json({ success: true, data: knowledge });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// READ - Search knowledge base
router.get('/search', async (req, res) => {
  try {
    const { q, category, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        error: "Search query 'q' is required" 
      });
    }

    const query = {
      $text: { $search: q }
    };
    
    if (category) {
      query.category = category;
    }

    const results = await KnowledgeBase.find(query, {
      score: { $meta: "textScore" }
    })
      .sort({ score: { $meta: "textScore" }, priority: -1 })
      .limit(parseInt(limit));

    // Increment views for returned results
    await Promise.all(results.map(doc => doc.incrementViews()));

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// READ - Get all knowledge
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    
    const knowledge = await KnowledgeBase.find(query)
      .sort({ priority: -1, views: -1 });
    
    res.json({ success: true, data: knowledge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// READ - Get single knowledge entry
router.get('/:id', async (req, res) => {
  try {
    const knowledge = await KnowledgeBase.findById(req.params.id);
    if (!knowledge) {
      return res.status(404).json({ 
        success: false, 
        error: "Knowledge entry not found" 
      });
    }
    
    await knowledge.incrementViews();
    res.json({ success: true, data: knowledge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const knowledge = await KnowledgeBase.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!knowledge) {
      return res.status(404).json({ 
        success: false, 
        error: "Knowledge entry not found" 
      });
    }
    
    res.json({ success: true, data: knowledge });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const knowledge = await KnowledgeBase.findByIdAndDelete(req.params.id);
    if (!knowledge) {
      return res.status(404).json({ 
        success: false, 
        error: "Knowledge entry not found" 
      });
    }
    res.json({ success: true, data: knowledge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const knowledge = await KnowledgeBase.findById(req.params.id);
    if (!knowledge) {
      return res.status(404).json({ 
        success: false, 
        error: "Knowledge entry not found" 
      });
    }
    
    await knowledge.markHelpful();
    res.json({ success: true, data: knowledge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
