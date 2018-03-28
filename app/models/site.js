const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  url: {
    type: String,
    required: 'Url сайта не должен быть пустым.',
    // validate: [
    //   {
    //     validator(value) {
    //       return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
    //     },
    //     msg:       'Некорректный email.'
    //   }
    // ],
    unique: 'Сайт с таким url уже существует'
  },
  name: {
    type: String,
    required: 'У сайта должно быть название'
  },
  token: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

siteSchema.virtual('siteElements', {
  ref: 'SiteElement', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'siteId' // is equal to `foreignField`s
});
siteSchema.virtual('siteVersions', {
  ref: 'SiteVersion', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'siteId' // is equal to `foreignField`s
});

siteSchema.statics.publicFields = ['url', 'name', 'token'];

module.exports = mongoose.model('Site', siteSchema);
