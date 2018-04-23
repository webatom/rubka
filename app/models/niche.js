const mongoose = require('mongoose');

// uniqueValidator validation is not atomic! unsafe!
const nicheSchema = new mongoose.Schema({
  title: {
    type: String,
    required: 'У ниши должно быть название'
  }
}, {
  toObject: {
    virtuals: true
  }
});

nicheSchema.virtual('sites', {
  ref: 'Site', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'nicheId' // is equal to `foreignField`s
});

nicheSchema.statics.publicFields = ['title'];

module.exports = mongoose.model('Niche', nicheSchema);
