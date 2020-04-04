import dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    port: process.env.PORT
  },
  db: {
    uri: process.env.MONGO_URI,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
  }
}