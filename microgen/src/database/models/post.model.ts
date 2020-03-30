import mongoose, { Document, Schema } from 'mongoose'

export interface IPost {
  _id: string
  text: string
  userId: string
}

const PostSchema = new Schema({
  text: { type: String },
  userId: { type: String },
})

export interface PostType extends IPost, Document {
  _id: string
}

export default mongoose.model<PostType>('Post', PostSchema, 'Post')