import * as joi from "joi"

export const registerSchema = joi.object({
  email: joi.string().email().required(),
  firstName: joi.string().required().max(256).min(2),
  lastName: joi.string().required().max(256).min(2),
})

export const loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
})
