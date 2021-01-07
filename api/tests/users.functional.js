import chai from 'chai'
import chaiHttp from 'chai-http'
import dotenv from 'dotenv'
const assert = chai.assert

dotenv.config()
chai.use(chaiHttp)

const testUser = {
  email: 'test@test.com',
  password: 'Secr3t#s'
}

const server = 'http://localhost:' + process.env.PORT

suite('Functional testing of users API calls', function () {
  suite('Test creating new user - POST /users', function () {
    test('Should create a new user when parameters are correct', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send(testUser)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.success)
          done()
        })
    })
    test('Should not allow duplicate emails', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send(testUser)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.error)
          done()
        })
    })
    test('Should not allow missing reggistration info', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send({})
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.error)
          done()
        })
    })
    test('Should not allow registration with missing email', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send({ password: 'Secr3t#s' })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.error)
          done()
        })
    })
    test('Should not allow registration with missing password', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send({ email: 'only@email.com' })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.error)
          done()
        })
    })
    test('Should not allow registration with invalid email', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send({
          email: 'invalid.com',
          password: 'Secr3t#s'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.error)
          done()
        })
    })
    test('Should not allow registration with invalid password', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send({
          email: 'invalid@password.com',
          password: 'Secret'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.error)
          done()
        })
    })
  })

  suite('Testing logging in - POST /sessions', function () {
    test('Should create a new session when credentials are correct', function (done) {
      chai.request(server)
        .post('/sessions')
        .type('form')
        .send(testUser)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.session_id)
          assert.exists(res.body.user_id)
          testUser.jwt = res.headers['x-access-token']
          testUser.session_id = res.body.session_id
          testUser.user_id = res.body.user_id
          done()
        })
    })
    test('Should create a 2nd session when credentials are correct', function (done) {
      chai.request(server)
        .post('/sessions')
        .type('form')
        .send(testUser)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.session_id)
          assert.exists(res.body.user_id)
          testUser.jwt2 = res.headers['x-access-token']
          testUser.session_id2 = res.body.session_id
          done()
        })
    })
    test('Should not create a new session when email does not exist', function (done) {
      chai.request(server)
        .post('/sessions')
        .type('form')
        .send({
          email: 'not@existing.com',
          password: 'Secr3t#s'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not create a new session when password is wrong', function (done) {
      chai.request(server)
        .post('/sessions')
        .type('form')
        .send({
          email: 'tesT@tEst.com',
          password: 'wrong'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not create a new session when email is missing', function (done) {
      chai.request(server)
        .post('/sessions')
        .type('form')
        .send({
          password: 'Secr3t#s'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not create a new session when password is missing', function (done) {
      chai.request(server)
        .post('/sessions')
        .type('form')
        .send({
          email: 'test@test.com'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
  })
  suite('Testing logging out - DELETING /sessions/:id', function () {
    test('Should not delete session when credentials are incorrect', function (done) {
      chai.request(server)
        .delete('/sessions/' + testUser.session_id2)
        .set('x-access-token', testUser.jwt.slice(1))
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not delete session when session id is incorrect', function (done) {
      chai.request(server)
        .delete('/sessions/' + testUser.session_id2.slice(1))
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should delete session when credentials are correct', function (done) {
      chai.request(server)
        .delete('/sessions/' + testUser.session_id2)
        .set('x-access-token', testUser.jwt2)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.success)
          done()
        })
    })
  })

  suite('Testing getting user\' profile - GET /users/:id', function () {
    test('Should be able to get own profile when jwt is correct', function (done) {
      chai.request(server)
        .get('/users/' + testUser.user_id)
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body._id, testUser.user_id)
          assert.equal(res.body.email, testUser.email)
          assert.exists(res.body.sessions)
          assert.notExists(res.body.password)
          done()
        })
    })
    test('Should not able to get profile without deleted session', function (done) {
      chai.request(server)
        .get('/users/' + testUser.user_id)
        .set('x-access-token', testUser.jwt2)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not able to get profile without authentication', function (done) {
      chai.request(server)
        .get('/users/' + testUser.user_id)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not able to get different user\'s profile', function (done) {
      chai.request(server)
        .get('/users/' + testUser.user_id.slice(1))
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
  })

  suite('Testing updating user\' profile - PUT /users/:id', function () {
    test('Should be able to update own profile when jwt is correct', function (done) {
      chai.request(server)
        .put('/users/' + testUser.user_id)
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({
          email: 'new@email.com',
          password: 'newPassword1@'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.success)
          done()
        })
    })
    test('Should not be able to update own profile when jwt is incorrect', function (done) {
      chai.request(server)
        .put('/users/' + testUser.user_id)
        .set('x-access-token', testUser.jwt.slice(1))
        .type('form')
        .send({
          email: 'new@email.com',
          password: 'newPassword1@'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not be able to update own profile when information is missing', function (done) {
      chai.request(server)
        .put('/users/' + testUser.user_id)
        .set('x-access-token', testUser.jwt)
        .type('form')
        .send({})
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
  })

  suite('Testing deleting user - DELETE /users/:id', function () {
    test('Should not able to delete user when jwt is incorrect', function (done) {
      chai.request(server)
        .delete('/users/' + testUser.user_id)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not able to delete different user', function (done) {
      chai.request(server)
        .delete('/users/' + '5ff7207ce394410035565900')
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should be able to delete user with correct jwt', function (done) {
      chai.request(server)
        .delete('/users/' + testUser.user_id)
        .set('x-access-token', testUser.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.users.success)
          assert.exists(res.body.sessions.success)
          done()
        })
    })
  })
})
