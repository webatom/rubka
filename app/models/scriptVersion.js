const mongoose = require('mongoose');
const random = require('mongoose-simple-random');

const scriptVersionSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false
  },
  siteScriptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SiteScript',
    required: 'Неуказан id сценария'
  }
}, {
  toObject: {
    virtuals: true
  }
});

scriptVersionSchema.virtual('elementsValue', {
  ref: 'SiteElementValue',
  localField: '_id',
  foreignField: 'scriptVersionId'
});

scriptVersionSchema.statics.publicFields = ['isActive', 'siteScriptId'];

scriptVersionSchema.plugin(random);

module.exports = mongoose.model('ScriptVersion', scriptVersionSchema);
