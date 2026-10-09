const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false,
    default: ""
  },
  projectType: {
    type: String,
    default: ""
  },
  client: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  budget: {
    type: String,
    default: ""
  },
  duration: {
    type: String,
    default: ""
  },
  result: {
    type: String,
    default: ""
  },
  // ... autres champs
  createdAt: {
    type: Date,
    default: Date.now
  }
});

projectSchema.index({ createdAt: -1 });

// ✅ Vérifier si le modèle existe déjà
module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);