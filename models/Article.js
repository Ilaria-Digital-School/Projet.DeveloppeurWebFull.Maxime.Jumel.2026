const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString()
  },
  category: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

articleSchema.index({ createdAt: -1 });
articleSchema.index({ category: 1, createdAt: -1 });

// ✅ Vérifier si le modèle existe déjà
module.exports = mongoose.models.Article || mongoose.model('Article', articleSchema);