import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId,
  email: string,
  password: string,
  roles?: roles[],
  notes: ObjectId[],
  tags: string[],
  sessions: Session[]
}

export interface Note {
   _id: ObjectId,
   title: string,
   body: string,
   favorite: boolean,
   tags?: string[],
   files: ObjectId[],
   created_on?: Date,
   updated_on?: Date
}

export interface Session {
  _id: ObjectId,
  expiry: Date,
  user_agent: string,
  last_access: Date
}

export interface decodedJWT {
  user_id?: string,
  session_id?: string
}

export enum roles {
  'user' = 'user',
  'admin' = 'admin'
}
