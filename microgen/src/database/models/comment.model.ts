import mongoose, { Document, Schema } from 'mongoose'

export interface IComment {
  _id: string
  text: string
  postId: string
  userId: string
}

const CommentSchema = new Schema({
  text: { type: String },
  postId: { type: String },
  userId: { type: String },
})

export interface CommentType extends IComment, Document {
  _id: string
}

export default mongoose.model<CommentType>('Comment', CommentSchema, 'Comment')