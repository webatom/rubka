const mongoose = require('mongoose');

// uniqueValidator validation is not atomic! unsafe!
const siteElementValueSchema = new mongoose.Schema({
  value: {
    type: String,
    default: ''
  },
  isEmpty: {
    type: Boolean,
    default: false
  },
  siteElementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SiteEmelent',
    required: 'Неуказан id эклемента'
  },
  scriptVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScriptVersion',
    required: 'Неуказан сценарий'
  }
});

siteElementValueSchema.statics.publicFields = ['value', 'siteElementId', 'isEmpty', 'scriptVersionId'];

module.exports = mongoose.model('SiteElementValue', siteElementValueSchema);
