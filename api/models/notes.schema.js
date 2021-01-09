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
          bsonType: ['objectId'],
          description: 'Array containing the files associated with the notes',
          uniqueItems: true
        },
        tags: {
          bsonType: ['string'],
          description: 'Array containing the tags associated with the notes',
          uniqueItems: true
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

db.notes.createIndex({ tags: 1 })
