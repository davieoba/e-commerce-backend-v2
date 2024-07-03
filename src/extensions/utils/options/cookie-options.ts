interface Ioptions {
  maxAge: number
  httpOnly: boolean
  secure: boolean
  sameSite: "Lax" | "None" | "Secure"
  path: string
  domain?: string
}

export const options: Ioptions = {
  maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "development" ? "Lax" : "None",
  path: process.env.NODE_ENV === "development" ? "/api/v1/auth/refresh" : "/",
}

if (process.env.NODE_ENV === "development") {
  options.domain = "localhost"
}

export const accessCookieOpt = {
  maxAge: 60 * 60 * 14 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
}
