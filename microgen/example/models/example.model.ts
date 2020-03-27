import mongoose, { Document, Schema } from 'mongoose'

export interface Example {
  fields: string
}

const ExampleSchema = new Schema({
  schema: String
})

interface ExampleType extends Example, Document {
  _id: string
}

export default mongoose.model<ExampleType>('Example', ExampleSchema, 'Example')