import express from "express"
import http from "http"

const app = express()

const server = http.createServer(app)
// const SERVER_PORT = process.env.NODE_ENV === 'test' ? TEST_PORT : PORT
server.listen(5000, () => {
  // logger.info(``)
  console.log(`Server running on http://localhost:5000`)
})
