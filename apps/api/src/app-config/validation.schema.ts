import * as joi from 'joi';

export default joi.object({
  PORT: joi.number().default(3001),
  JWT_SECRET: joi.string().required(),
  SALT_ROUNDS: joi.number().default(10),
});
