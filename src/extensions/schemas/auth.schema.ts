import { Request } from "express"
import * as joi from "joi"

interface Data {
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

interface RegisterValidationResult {
  success: boolean
  error?: string
  data?: Data
}

interface LoginValidationResult {
  success: boolean
  error?: string
  data?: Pick<Data, "email" | "password">
}

export const registerSchema = joi.object({
  email: joi.string().email().required(),
  firstName: joi.string().required().max(256).min(2),
  lastName: joi.string().required().max(256).min(2),
  password: joi.string().required(),
  confirmPassword: joi.string().required(),
})

export const loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
})

export const validateRegisterSchema = (
  req: Request
): RegisterValidationResult => {
  const { error, value } = registerSchema.validate(req.body)

  if (error) {
    return {
      success: false,
      error: `Validation Error: ${error.details
        .map((x) => x.message)
        .join(", ")}`,
    }
  }

  return {
    success: true,
    data: value,
  }
}

export const validateLoginSchema = (req: Request): LoginValidationResult => {
  const { error, value } = loginSchema.validate(req.body)
  if (error) {
    return {
      success: false,
      error: `Validation Error: ${error.details
        .map((x) => x.message)
        .join(", ")}`,
    }
  }

  return {
    success: true,
    data: value,
  }
}
