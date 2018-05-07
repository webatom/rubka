const mongoose = require('mongoose');
const config = require('config');
mongoose.Promise = Promise;

const beautifyUnique = require('mongoose-beautiful-unique-validation');

// вместо MongoError будет выдавать ValidationError (проще ловить и выводить)
mongoose.plugin(beautifyUnique);
// выводит все запросы в консоль
// mongoose.set('debug', true);

mongoose.plugin(schema => {
  if (!schema.options.toObject) {
    schema.options.toObject = {};
  }

  if (schema.options.toObject.transform == undefined) {
    schema.options.toObject.transform = (doc, ret) => { delete ret.__v; delete ret._id; return ret; };
  }
});

mongoose.connect(config.mongodb.uri, {});

module.exports = mongoose;
