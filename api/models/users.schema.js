db = db.getSiblingDB('notes')

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'roles'],
      properties: {
        _id: {},
        email: {
          bsonType: 'string',
          description: 'Unique email according to regex',
          pattern: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
        },
        password: {
          bsonType: 'string',
          description: 'Hashed password'
        },
        roles: {
          bsonType: ['array'],
          items: {
            bsonType: 'string',
            enum: ['user', 'admin']
          },
          description: 'Array containing roles assigned to user'
        },
        notes: {
          bsonType: ['array'],
          description: 'Array containing the user\'s notes',
          uniqueItems: true,
          items: {
            bsonType: 'objectId'
          }
        },
        tags: {
          bsonType: ['array'],
          description: 'Array containing the user\'s unique tags',
          uniqueItems: true,
          items: {
            bsonType: 'string'
          }
        },
        sessions: {
          bsonType: ['array'],
          description: 'Array of user\'s sessions',
          items: {
            bsonType: 'object',
            additionalProperties: false,
            required: ['_id', 'expiry', 'user_agent', 'last_access'],
            properties: {
              _id: {
                bsonType: 'objectId',
                description: 'Session id'
              },
              expiry: {
                bsonType: 'date',
                description: 'Date when session will expire'
              },
              user_agent: {
                bsonType: 'string',
                description: 'User agent of the session'
              },
              last_access: {
                bsonType: 'date',
                description: 'Last time session was used'
              }
            }
          }
        }
      }
    }
  }
})

db.users.createIndex({ email: 1 }, {
  unique: true,
  collation: { locale: 'en', strength: 2 }
})
