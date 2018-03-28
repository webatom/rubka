const mongoose = require('mongoose');

// uniqueValidator validation is not atomic! unsafe!
const siteVersionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'У варианта сайта должно быть название'
  },
  mlType: {
    type: String,
    required: 'У элемента должен быть ml_type'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site'
  }
}, {
  toObject: {
    virtuals: true
  }
  // timestamps: true
  /* @see mongoose
  toObject: {
    transform(doc, ret) {
      // remove the __v of every document before returning the result
      delete ret.__v;
      return ret;
    }
  } */
});

siteVersionSchema.statics.publicFields = ['name', 'mlType', 'isActive', 'siteId'];

module.exports = mongoose.model('SiteVersion', siteVersionSchema);
