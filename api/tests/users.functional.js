import { suite, test } from 'mocha'
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

const testUser2 = {
  email: 'test2@test.com',
  password: 'Secr3t#s'
}

const sessionInfo = {}

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
          assert.exists(res.body._id)
          sessionInfo.jwt = res.headers['x-access-token']
          sessionInfo.session_id = res.body.sessions[0]._id
          sessionInfo.user_id = res.body._id
          done()
        })
    })
    test('Should create a 2nd new user when parameters are correct', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send(testUser2)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body._id)
          testUser2.jwt = res.headers['x-access-token']
          testUser2.session_id = res.body.sessions[0]._id
          testUser2.user_id = res.body._id
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
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('MongoError: E11000 duplicate key error collection'))
          done()
        })
    })
    test('Should not allow duplicate emails (case insensitive)', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send({
          email: 'TesT@tEst.com',
          password: 'Secr3t#s'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('MongoError: E11000 duplicate key error collection'))
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
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Please provide email')
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
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Please provide email')
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
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Please provide password')
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
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('MongoError: Document failed validation'))
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
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('Password should have 1 lowercase'))
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
          assert.exists(res.body.sessions[0]._id)
          assert.exists(res.body._id)
          sessionInfo.jwt1 = res.headers['x-access-token']
          sessionInfo.session_id1 = res.body.sessions[0]._id
          done()
        })
    })
    test('Should create a 2nd session when credentials are correct (email case insensitive)', function (done) {
      chai.request(server)
        .post('/sessions')
        .type('form')
        .send({
          email: 'TesT@tEst.cOm',
          password: 'Secr3t#s'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.sessions[0]._id)
          assert.exists(res.body._id)
          sessionInfo.jwt2 = res.headers['x-access-token']
          sessionInfo.session_id2 = res.body.sessions[0]._id
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
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'User not found')
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
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'Invalid credentials')
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
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Please provide email')
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
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Please provide password')
          done()
        })
    })
  })

  suite('Testing logging out - DELETING /sessions/:id', function () {
    test('Should not delete session when jwt is incorrect', function (done) {
      chai.request(server)
        .delete('/sessions/' + sessionInfo.session_id2)
        .set('x-access-token', sessionInfo.jwt2.slice(1))
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Should not delete session when session id is incorrect', function (done) {
      chai.request(server)
        .delete('/sessions/' + sessionInfo.session_id2.slice(1))
        .set('x-access-token', sessionInfo.jwt2)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.exists(res.body.error)
          done()
        })
    })
    test('Should not delete session of different user', function (done) {
      chai.request(server)
        .delete('/sessions/' + testUser2.session_id)
        .set('x-access-token', sessionInfo.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Error deleting session')
          done()
        })
    })
    test('Should delete session when credentials are correct', function (done) {
      chai.request(server)
        .delete('/sessions/' + sessionInfo.session_id2)
        .set('x-access-token', sessionInfo.jwt2)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.success, 'Succesfully logged out the user')
          done()
        })
    })
  })

  suite('Testing getting user\' profile - GET /users/:id', function () {
    test('Should be able to get own profile when jwt is correct', function (done) {
      chai.request(server)
        .get('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body._id, sessionInfo.user_id)
          assert.equal(res.body.email, testUser.email)
          assert.exists(res.body.sessions)
          assert.notExists(res.body.password)
          done()
        })
    })
    test('Should not able to get profile with deleted session', function (done) {
      chai.request(server)
        .get('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt2)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'Cannot authenticate user')
          done()
        })
    })
    test('Should not able to get profile without authentication', function (done) {
      chai.request(server)
        .get('/users/' + sessionInfo.user_id)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'JsonWebTokenError: jwt must be provided')
          done()
        })
    })
    test('Should not able to get different user\'s profile', function (done) {
      chai.request(server)
        .get('/users/' + testUser2.user_id)
        .set('x-access-token', sessionInfo.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'Not authorized')
          done()
        })
    })
  })

  suite('Testing updating user\' profile - PUT /users/:id', function () {
    test('Should be able to update own profile when jwt is correct', function (done) {
      chai.request(server)
        .put('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt)
        .type('form')
        .send({
          email: 'new@email.com',
          password: 'newPassword1@'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.email, 'new@email.com')
          assert.equal(res.body._id, sessionInfo.user_id)
          done()
        })
    })
    test('Should be able to login with new credentials', function (done) {
      chai.request(server)
        .post('/sessions')
        .type('form')
        .send({
          email: 'new@email.com',
          password: 'newPassword1@'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.sessions[0]._id)
          assert.exists(res.body._id)
          done()
        })
    })
    test('Should not be able to update own profile when email is invalid', function (done) {
      chai.request(server)
        .put('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt)
        .type('form')
        .send({
          email: 'invalid.com',
          password: 'newPassword1@'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('MongoError: Document failed validation'))
          done()
        })
    })
    test('Should not be able to update own profile when password is invalid', function (done) {
      chai.request(server)
        .put('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt)
        .type('form')
        .send({
          email: 'new@email.com',
          password: 'secret'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.isTrue(res.body.error.startsWith('Password should have 1 lowercase'))
          done()
        })
    })
    test('Should not be able to update own profile when jwt is incorrect', function (done) {
      chai.request(server)
        .put('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt.slice(1))
        .type('form')
        .send({
          email: 'new@email.com',
          password: 'newPassword1@'
        })
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Should not be able to update own profile when information is missing', function (done) {
      chai.request(server)
        .put('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt)
        .type('form')
        .send({})
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Please provide paramters to update')
          done()
        })
    })
  })

  suite('Testing deleting user - DELETE /users/:id', function () {
    test('Should not able to delete user when jwt is missing', function (done) {
      chai.request(server)
        .delete('/users/' + sessionInfo.user_id)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'JsonWebTokenError: jwt must be provided')
          done()
        })
    })
    test('Should not able to delete user when jwt is incorrect', function (done) {
      chai.request(server)
        .delete('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt.slice(1))
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.isTrue(res.body.error.startsWith('JsonWebTokenError'))
          done()
        })
    })
    test('Should not able to delete different user', function (done) {
      chai.request(server)
        .delete('/users/' + testUser2.user_id)
        .set('x-access-token', sessionInfo.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 401)
          assert.equal(res.body.error, 'Not authorized')
          done()
        })
    })
    test('Should be able to delete user with correct jwt', function (done) {
      chai.request(server)
        .delete('/users/' + sessionInfo.user_id)
        .set('x-access-token', sessionInfo.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.success, 'Succesfully deleted user')
          done()
        })
    })
    test('Should be able to delete 2nd user with correct jwt', function (done) {
      chai.request(server)
        .delete('/users/' + testUser2.user_id)
        .set('x-access-token', testUser2.jwt)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.equal(res.body.success, 'Succesfully deleted user')
          done()
        })
    })
  })
})
