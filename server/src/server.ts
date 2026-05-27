import { app } from './app.js'
import { env } from './config/env.js'

app.listen(env.port, () => {
  console.log(`GameHub API is running on http://localhost:${env.port}/api`)
})
