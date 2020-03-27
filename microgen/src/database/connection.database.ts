import mongoose from 'mongoose'
import config from '../app/config'

export default class MongoConnection {
  private url: string = config.db.uri as string
  public createConnection() {
    return mongoose
      .connect(
        this.url,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true
        }
      )
  }
}