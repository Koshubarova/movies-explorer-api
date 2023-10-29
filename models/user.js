const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const validator = require('validator');
const UnautorizedError = require('../errors/UnautorizedError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Поле "name" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
  email: {
    type: String,
    unique: true,
    // validator: (v) => validator.isEmail(v),
    validator(url) {
      return /^\S+@\S+\.\S+$/.test(url);
    },
    required: [true, 'Введите почту'],
  },
  password: {
    type: String,
    required: [true, 'Введите пароль'],
    select: false,
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnautorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnautorizedError('Неправильные почта или пароль');
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
