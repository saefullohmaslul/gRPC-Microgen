import dotenv from 'dotenv'

dotenv.config()

export default {
  app: {

  },
  db: {
    uri: process.env.MONGO_URI,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
  }
}