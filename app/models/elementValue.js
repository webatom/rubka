const mongoose = require('mongoose');

// uniqueValidator validation is not atomic! unsafe!
const elementValueSchema = new mongoose.Schema({
  value: {
    type: String,
    required: 'У элемента должно быть название'
  },
  siteVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SiteVersion'
  }
}, {
  /* @see mongoose
  toObject: {
    transform(doc, ret) {
      // remove the __v of every document before returning the result
      delete ret.__v;
      return ret;
    }
  } */
});

elementValueSchema.statics.publicFields = ['value', 'siteVersionId'];

module.exports = mongoose.model('SiteElement', elementValueSchema);
