import Joi from 'joi';

export const passwordReg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
export default {
  signup: {
    password: Joi.string().regex(passwordReg).required(),
    userName: Joi.string().required(),
  },
};
