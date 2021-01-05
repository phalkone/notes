class usersDao {
  static collection

  static setCollection (coll) {
    usersDao.collection = coll
  }

  static async createUser (user) {
    try {
      const result = await usersDao.collection.insertOne(user)
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
