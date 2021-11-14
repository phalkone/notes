import { User } from '.'

declare module 'express-serve-static-core' {
  export interface Request {
    user : User
  }
}
