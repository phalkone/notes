import { before, after, suite, test } from 'mocha'
import chai from 'chai'
import chaiHttp from 'chai-http'
import dotenv from 'dotenv'
const assert = chai.assert

dotenv.config()
chai.use(chaiHttp)

const testUser = {
  email: 'test3@test.com',
  password: 'Secr3t#s'
}

const testUser2 = {
  email: 'test4@test.com',
  password: 'Secr3t#s'
}

const server = 'http://localhost:' + process.env.PORT

suite('Functional testing of users API calls', function () {
  before(function (done) {
    chai.request(server)
      .post('/users')
      .type('form')
      .send(testUser)
      .end(function (err, res) {
        if (err) return err
        testUser.jwt = res.headers['x-access-token']
        testUser.session_id = res.body.sessions[0]._id
        testUser.user_id = res.body._id
      })
    chai.request(server)
      .post('/users')
      .type('form')
      .send(testUser2)
      .end(function (err, res) {
        if (err) return err
        testUser2.jwt = res.headers['x-access-token']
        testUser2.session_id = res.body.sessions[0]._id
        testUser2.user_id = res.body._id
        done()
      })
  })

  suite('Test creating new note - POST /notes', function () {
    test('Should create a new note with all parameters', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          title: 'Test Title',
          body: 'Test body',
          favorite: true,
          tags: ['tag1', 'tag2']
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.note.title, 'Test Title')
          assert.equal(res.body.note.body, 'Test body')
          assert.isTrue(res.body.note.favorite)
          assert.equal(JSON.stringify(res.body.note.tags), JSON.stringify(['tag1', 'tag2']))
          assert.approximately(new Date(res.body.note.created_on).valueOf(), Date.now(), 500)
          testUser.note_id = res.body.note._id
          done()
        })
    })
    test('Should create a new note with only title', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser2.jwt)
        .type('form')
        .send({
          title: 'Test Title'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.note.title, 'Test Title')
          assert.isFalse(res.body.note.favorite)
          assert.approximately(new Date(res.body.note.created_on).valueOf(), Date.now(), 500)
          testUser2.note_id = res.body.note._id
          done()
        })
    })
    test('Should create a new note with only body', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          body: 'Test body'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.note.body, 'Test body')
          assert.isFalse(res.body.note.favorite)
          assert.approximately(new Date(res.body.note.created_on).valueOf(), Date.now(), 500)
          testUser.note2_id = res.body.note._id
          done()
        })
    })
    test('Should create a new note with only tags', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          tags: ['tag1', 'tag2', 'tag3', 'tag4']
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(JSON.stringify(res.body.note.tags), JSON.stringify(['tag1', 'tag2', 'tag3', 'tag4']))
          assert.approximately(new Date(res.body.note.created_on).valueOf(), Date.now(), 500)
          testUser.note3_id = res.body.note._id
          done()
        })
    })
    test('Should not create a new note with empty parameters', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({})
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not create a new note with invalid title type', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          title: { title: 123456789 },
          body: 'Test body',
          favorite: true,
          tags: ['tag1', 'tag2']
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('MongoServerError'))
          done()
        })
    })
    test('Should not create a new note with invalid body type', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          title: 'Test title',
          body: { body: 123456789 },
          favorite: true,
          tags: ['tag1', 'tag2']
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('MongoServerError'))
          done()
        })
    })
    test('Should create a new note with invalid favorite type', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          title: 'Test title',
          body: 'Test body',
          favorite: 123456789,
          tags: ['tag1', 'tag2']
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.isFalse(res.body.note.favorite)
          done()
        })
    })
    test('Should not create a new note with invalid tags type', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          title: 'Test title',
          body: 'Test body',
          favorite: true,
          tags: 123456789
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('MongoServerError'))
          done()
        })
    })
    test('Should not create a new note with missing jwt', function (done) {
      chai.request(server)
        .post('/notes')
        .type('form')
        .send({
          title: 'Test Title'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'JsonWebTokenError: jwt must be provided')
          done()
        })
    })
    test('Should not create a new note with incorrect jwt', function (done) {
      chai.request(server)
        .post('/notes')
        .set('x-access-token', testUser.jwt.slice(1))
        .type('form')
        .send({
          title: 'Test Title'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Tags of user should be correctly updated', function (done) {
      chai.request(server)
        .get('/users/' + testUser.user_id)
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(JSON.stringify(res.body.tags),
            JSON.stringify(['tag1', 'tag2', 'tag3', 'tag4']))
          done()
        })
    })
  })

  suite('Test getting notes from user - GET /notes', function () {
    test('Should get all notes', function (done) {
      chai.request(server)
        .get('/notes')
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.length, 4)
          done()
        })
    })
    test('Should get all notes with certain tag', function (done) {
      chai.request(server)
        .get('/notes')
        .set('x-access-token', testUser.jwt)
        .query({ tags: 'tag1' })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.length, 3)
          res.body.forEach((note) => {
            assert.isTrue(note.tags.includes('tag1'))
          })
          done()
        })
    })
    test('Should get all notes with certain title', function (done) {
      chai.request(server)
        .get('/notes')
        .set('x-access-token', testUser.jwt)
        .query({ title: 'Test' })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.length, 2)
          res.body.forEach((note) => {
            assert.isTrue(/test/i.test(note.title))
          })
          done()
        })
    })
    test('Should get all favorite notes', function (done) {
      chai.request(server)
        .get('/notes')
        .set('x-access-token', testUser.jwt)
        .query({ favorite: true })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body[0].favorite, true)
          done()
        })
    })
    test('Should get all favorite notes with certain title', function (done) {
      chai.request(server)
        .get('/notes')
        .set('x-access-token', testUser.jwt)
        .query({ title: 'Test Title', favorite: true })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body[0].title, 'Test Title')
          assert.equal(res.body[0].favorite, true)
          done()
        })
    })
    test('Should not get notes with missing jwt', function (done) {
      chai.request(server)
        .get('/notes')
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'JsonWebTokenError: jwt must be provided')
          done()
        })
    })
    test('Should not get notes with incorrect jwt', function (done) {
      chai.request(server)
        .get('/notes')
        .set('x-access-token', testUser.jwt.slice(1))
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
  })

  suite('Test getting one note - GET /notes/:id', function () {
    test('Should get an individual note', function (done) {
      chai.request(server)
        .get('/notes/' + testUser.note_id)
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body._id, testUser.note_id)
          assert.equal(res.body.body, 'Test body')
          assert.isTrue(res.body.favorite)
          assert.equal(JSON.stringify(res.body.tags),
            JSON.stringify(['tag1', 'tag2']))
          done()
        })
    })
    test('Should not get an individual note with missing jwt', function (done) {
      chai.request(server)
        .get('/notes/' + testUser.note_id)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'JsonWebTokenError: jwt must be provided')
          done()
        })
    })
    test('Should not get an individual note with incorrect jwt', function (done) {
      chai.request(server)
        .get('/notes/' + testUser.note_id)
        .set('x-access-token', testUser.jwt.slice(1))
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Should not get an individual note with incorrect id', function (done) {
      chai.request(server)
        .get('/notes/' + testUser.note_id.slice(1))
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Note not found or not authorised')
          done()
        })
    })
    test('Should not get an individual note with of different user', function (done) {
      chai.request(server)
        .get('/notes/' + testUser2.note_id)
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Note not found or not authorised')
          done()
        })
    })
  })

  suite('Test updating one note - PUT /notes/:id', function () {
    test('Should update an individual note with all parameters', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note_id)
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          title: 'New Title',
          body: 'New body',
          favorite: false,
          tags: ['tag1', 'tag2', 'tag5', 'tag6']
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.note._id, testUser.note_id)
          assert.equal(res.body.note.title, 'New Title')
          assert.equal(res.body.note.body, 'New body')
          assert.isFalse(res.body.note.favorite)
          assert.equal(JSON.stringify(res.body.note.tags),
            JSON.stringify(['tag1', 'tag2', 'tag5', 'tag6']))
          assert.approximately(new Date(res.body.note.updated_on).valueOf(), Date.now(), 500)
          done()
        })
    })
    test('Should update an individual note title', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note2_id)
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          title: 'New Title'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.note._id, testUser.note2_id)
          assert.equal(res.body.note.title, 'New Title')
          assert.equal(res.body.note.body, 'Test body')
          assert.isFalse(res.body.note.favorite)
          assert.approximately(new Date(res.body.note.updated_on).valueOf(),
            Date.now(), 500)
          done()
        })
    })
    test('Should update an individual note body', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note3_id)
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          body: 'New Body'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.note._id, testUser.note3_id)
          assert.equal(res.body.note.body, 'New Body')
          assert.equal(JSON.stringify(res.body.note.tags),
            JSON.stringify(['tag1', 'tag2', 'tag3', 'tag4']))
          assert.isFalse(res.body.note.favorite)
          assert.approximately(new Date(res.body.note.updated_on).valueOf(),
            Date.now(), 500)
          done()
        })
    })
    test('Should update an individual note favorite', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note_id)
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          favorite: true
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.note._id, testUser.note_id)
          assert.equal(res.body.note.title, 'New Title')
          assert.equal(res.body.note.body, 'New body')
          assert.isTrue(res.body.note.favorite)
          assert.equal(JSON.stringify(res.body.note.tags),
            JSON.stringify(['tag1', 'tag2', 'tag5', 'tag6']))
          assert.approximately(new Date(res.body.note.updated_on).valueOf(),
            Date.now(), 500)
          done()
        })
    })
    test('Should update an individual note tags', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note_id)
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          tags: ['tag1', 'tag2', 'tag5', 'tag6', 'tag7']
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.note._id, testUser.note_id)
          assert.equal(res.body.note.title, 'New Title')
          assert.equal(res.body.note.body, 'New body')
          assert.isFalse(res.body.note.favorite)
          assert.equal(JSON.stringify(res.body.note.tags),
            JSON.stringify(['tag1', 'tag2', 'tag5', 'tag6', 'tag7']))
          assert.approximately(new Date(res.body.note.updated_on).valueOf(),
            Date.now(), 500)
          done()
        })
    })
    test('Should not update an individual note with wrong type', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note_id)
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          title: { title: 'test' },
          body: { body: 'test' },
          favorite: 123456,
          tags: { tags: 'test' }
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('MongoServerError'))
          done()
        })
    })
    test('Should not update an individual note with missing jwt', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note_id)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'JsonWebTokenError: jwt must be provided')
          done()
        })
    })
    test('Should not update an individual note with incorrect jwt', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note_id)
        .set('x-access-token', testUser.jwt.slice(1))
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Should not update an individual note with incorrect id', function (done) {
      chai.request(server)
        .put('/notes/' + testUser.note_id.slice(1))
        .set('x-access-token', testUser.jwt.slice)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Should not update an individual note with of different user', function (done) {
      chai.request(server)
        .put('/notes/' + testUser2.note_id)
        .set('x-access-token', testUser.jwt.slice)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Tags of user should be correctly updated', function (done) {
      chai.request(server)
        .get('/users/' + testUser.user_id)
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(JSON.stringify(res.body.tags),
            JSON.stringify(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7']))
          done()
        })
    })
  })

  suite('Test deleting one note - DELETE /notes/:id', function () {
    test('Should delete an individual note', function (done) {
      chai.request(server)
        .delete('/notes/' + testUser.note_id)
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.isFalse(res.body.user.notes.includes(testUser.note_id))
          done()
        })
    })
    test('Should not delete an individual note with missing jwt', function (done) {
      chai.request(server)
        .delete('/notes/' + testUser.note2_id)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'JsonWebTokenError: jwt must be provided')
          done()
        })
    })
    test('Should not delete an individual note with incorrect jwt', function (done) {
      chai.request(server)
        .delete('/notes/' + testUser.note2_id)
        .set('x-access-token', testUser.jwt.slice(1))
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Should not delete an individual note with incorrect id', function (done) {
      chai.request(server)
        .delete('/notes/' + testUser.note_id.slice(1))
        .set('x-access-token', testUser.jwt.slice)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Should not delete an individual note with of different user', function (done) {
      chai.request(server)
        .delete('/notes/' + testUser2.note_id)
        .set('x-access-token', testUser.jwt.slice)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
  })

  after(function (done) {
    chai.request(server)
      .delete('/users/' + testUser.user_id)
      .set('x-access-token', testUser.jwt)
      .end(function (err, res) {
        if (err) return err
      })
    chai.request(server)
      .delete('/users/' + testUser2.user_id)
      .set('x-access-token', testUser2.jwt)
      .end(function (err, res) {
        if (err) return err
        done()
      })
  })
})
