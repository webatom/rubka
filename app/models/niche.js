const mongoose = require('mongoose');

const nicheSchema = new mongoose.Schema({
  title: {
    type: String,
    required: 'У ниши должно быть название',
    unique: 'Название ниши должно быть уникальным'
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
