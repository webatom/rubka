const mongoose = require('mongoose');

const siteScriptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'У элемента должно быть название'
  },
  utm_term: {
    type: String,
    required: 'У элемента должена быть utm метка'
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site'
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  toObject: {
    virtuals: true
  }
});

siteScriptSchema.statics.publicFields = ['name', 'utm_term', 'siteId', 'isActive'];

module.exports = mongoose.model('SiteScript', siteScriptSchema);
