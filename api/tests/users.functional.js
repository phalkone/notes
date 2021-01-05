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
  suite('Test of POST /users', function () {
    test('Should create a new user when parameters are correct', function (done) {
      chai.request(server)
        .post('/users')
        .type('form')
        .send(testUser)
        .end(function (err, res) {
          if (err) return err
          assert.equal(res.status, 200)
          assert.exists(res.body.succes)
          done()
        })
    })
  })
})
