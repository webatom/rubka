const mongoose = require('mongoose');

// uniqueValidator validation is not atomic! unsafe!
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
  status: {
    type: Boolean,
    default: false
  }
}, {
  toObject: {
    virtuals: true
  }
});

siteScriptSchema.statics.publicFields = ['name', 'utm_term', 'siteId', 'status'];

module.exports = mongoose.model('SiteScript', siteScriptSchema);
