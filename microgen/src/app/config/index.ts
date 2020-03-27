import dotenv from 'dotenv'

dotenv.config()

export default {
  app: {

  },
  db: {
    uri: process.env.MONGO_URI
  }
}