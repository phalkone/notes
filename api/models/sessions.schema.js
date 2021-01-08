db = db.getSiblingDB('notes')

db.createCollection('sessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'expiry', 'last_access'],
      properties: {
        _id: {},
        user_id: {
          bsonType: 'objectId',
          description: 'ObjectId of linked user'
        },
        expiry: {
          bsonType: 'date',
          description: 'Date when session will expire'
        },
        last_access: {
          bsonType: 'date',
          description: 'Last time session was used'
        }
      }
    }
  }
})

db.sessions.createIndex({ user_id: 1 })
