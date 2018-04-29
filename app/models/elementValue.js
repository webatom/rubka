const mongoose = require('mongoose');

// uniqueValidator validation is not atomic! unsafe!
const siteElementValueSchema = new mongoose.Schema({
  value: {
    type: String,
    required: 'У элемента должно быть название'
  },
  siteElementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SiteEmelent',
    required: 'Неуказан id эклемента'
  },
  siteScriptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SiteScript',
    required: 'Неуказан сценарий'
  }
});

siteElementValueSchema.statics.publicFields = ['value', 'siteElementId', 'siteScriptId'];

module.exports = mongoose.model('SiteElementValue', siteElementValueSchema);
