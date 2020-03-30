import mongoose, { Document, Schema } from 'mongoose'

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
}

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
})

export interface UserType extends IUser, Document {
  _id: string
}

export default mongoose.model<UserType>('User', UserSchema, 'User')