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
          pattern: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))'
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
          bsonType: ['objectId'],
          description: 'Array containing the user\'s notes',
          uniqueItems: true
        },
        tags: {
          bsonType: ['string'],
          description: 'Array containing the user\'s unique tags',
          uniqueItems: true
        }
      }
    }
  }
})

db.users.createIndex({ email: 1 }, { 
  unique: true,
  collation: { locale: 'en', strength: 2 }
 })
