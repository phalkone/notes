db = db.getSiblingDB('notes')

db.createCollection('sessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'expiry'],
      properties: {
        _id: {},
        user_id: {
          bsonType: 'objectId',
          description: 'ObjectId of linked user'
        },
        expiry: {
          bsonType: 'date',
          description: 'Date when session will expire'
        }
      }
    }
  }
})

db.sessions.createIndex({ user_id: 1 })
