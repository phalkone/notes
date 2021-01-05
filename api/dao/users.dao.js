let collection

class usersDao {
  static setCollection (coll) {
    collection = coll
  }

  static async createUser (user) {
    try {
      const result = await collection.insertOne(user)
      if (result.insertedCount === 1) {
        return { succes: 'Succesfully added user' }
      } else {
        return { error: 'An error occured while creating the user' }
      }
    } catch (err) {
      return err
    }
  }
}

export { usersDao }
