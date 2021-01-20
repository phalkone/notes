db = db.getSiblingDB('notes')

db.createCollection('notes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['created_on', 'updated_on'],
      properties: {
        _id: {},
        title: {
          bsonType: 'string',
          description: 'Title of the note'
        },
        body: {
          bsonType: 'string',
          description: 'Body of the note'
        },
        favorite: {
          bsonType: 'bool',
          description: 'Marked as favorite'
        },
        files: {
          bsonType: ['array'],
          description: 'Array containing the user\'s unique files',
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
        created_on: {
          bsonType: 'date',
          description: 'Time note was created'
        },
        updated_on: {
          bsonType: 'date',
          description: 'Time note was last updated'
        }
      }
    }
  }
})

db.notes.createIndex({ title: 'text' })
db.notes.createIndex({ tags: 1 })
