const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { regexEmail } = require('../utils/constants');

const { getUserMe, editUser } = require('../controllers/users');

router.get('/users/me', getUserMe);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().pattern(regexEmail),
  }),

}), editUser);

module.exports = router;
