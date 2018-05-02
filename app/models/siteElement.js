const mongoose = require('mongoose');

// uniqueValidator validation is not atomic! unsafe!
const siteElementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'У элемента должно быть название'
  },
  keyName: {
    type: String,
    required: 'У элемента должен быть keyName'
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: 'Не указан сайт'
  }
}, {
  toObject: {
    virtuals: true
  }
});

siteElementSchema.statics.publicFields = ['name', 'keyName', 'siteId'];

module.exports = mongoose.model('SiteElement', siteElementSchema);
