import mongoose, { Document, Schema } from 'mongoose'

export interface IExample {
  fields: string
}

const ExampleSchema = new Schema({
  schema: String
})

export interface ExampleType extends IExample, Document {
  _id: string
}

export default mongoose.model<ExampleType>('Example', ExampleSchema, 'Example')