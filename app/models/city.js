const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'У города должно быть название',
    unique: 'Такой город уже есть в базе'
  }
}, {
  toObject: {
    virtuals: true
  }
});

citySchema.virtual('sites', {
  ref: 'Site', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'cityId' // is equal to `foreignField`s
});

citySchema.statics.publicFields = ['name'];

module.exports = mongoose.model('City', citySchema);
