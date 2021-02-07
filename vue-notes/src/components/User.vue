<template>
  <div class="overlay" :class="[{hide: hidden}, type === 'Update' ? 'transparant' : 'non-transparant']">
    <div class="form-window">
      <div class="close" :class="type !== 'Update' ? 'hide' : ''" @click="$emit('hide')">
        <img src="images/close.svg" alt="Close">
      </div>
      <form :class="type === 'Update' ? 'close-margin' : ''" @submit.prevent="submit">
        <input v-model="emailaddress" type="email" name="email" placeholder="e-mail" required>
        <br>
        <input v-model="password" type="password" name="password" placeholder="password"
          title="Password should have 1 lowercase letter, 1 uppercase letter, 1 number and be at least 8 characters long"
          :required="type === 'Update' ? false : true" 
          pattern="(?=(.*[0-9]))(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}" onchange="this.setCustomValidity(this.validity.patternMismatch ? this.title : '');
                    form.password2.pattern = RegExp.escape(this.value);">
        <br>
        <input title="Please enter the same Password as above" type="password" name="password2" 
              placeholder="repeat password" :required="type === 'Register' ? true : false" 
              :class="type === 'Login' ? 'hide' : ''"
              pattern="(?=(.*[0-9]))(?=.*[!@#$%^&*()\\[\]{}\-_+=~`|:;<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}"
              onchange="this.setCustomValidity(this.validity.patternMismatch ? this.title : '')">
        <br>
        <button :class="type === 'Login' ? 'login-margin' : 'register-margin'" type="submit">{{ type }}</button>
      </form>
      <div class="register" :class="type !== 'Login' ? 'hide' : ''">
        <a @click="$emit('type', 'Register')">Register a new account</a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'User',
  props: {
    hidden: Boolean,
    email: String,
    type: String,
    url: String
  },
  emits: ['user', 'hide', 'type', 'error'],
  data() {
    return {
    emailaddress: this.email,
    password: null
    }
  },
  methods: {
    submit() {
      switch(this.type){
        case 'Login':
          this.login()
          break
        case 'Register':
          this.register()
          break
        case 'Update':
          this.update()
          break
      }
    },
    register() {
      let self = this
      axios.post(this.url + '/users', {
        email: this.emailaddress,
        password: this.password
      }).then(function(response) {
        localStorage.setItem('x-access-token',response.headers['x-access-token'])
        self.$emit('user', response.data)
        self.$emit('hide')
      }).catch(function(error) {
        self.$emit('error', 'Error', error.response.data)
      } )
    },
    update() {
      let self = this
      axios({
        url: this.url + '/users/' + localStorage.getItem('id'),
        method: 'put',
        headers: {'x-access-token': localStorage.getItem('x-access-token')},
        data: {
          email: this.emailaddress,
          password: this.password
        }
      }).then(function(response) {
        self.$emit('user', response.data)
        self.$emit('hide')
      }).catch(function(error) {
        self.$emit('error', 'Error', error.response.data)
      } )
    },
    login() {
      let self = this
      axios.post(this.url + '/sessions', {
        email: this.emailaddress,
        password: this.password
      }).then(function(response) {
        localStorage.setItem('x-access-token',response.headers['x-access-token'])
        self.$emit('user', response.data)
        self.$emit('hide')
      }).catch(function(error) {
        self.$emit('error', 'Error', error.response.data)
      } )
    }
  }
}

  if(!RegExp.escape) {
    RegExp.escape = function(s) {
      return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
    }
  }
</script>

<style scoped>
  .overlay {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .transparant {
    background:rgba(1, 22, 39,0.6);
  }

  .non-transparant {
    background: #011627;
  }

  .hide {
    display: none;
  }

  button {
    background-color: #011627;
    border: none;
    color: #3794FF;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 28px;
    font-family: 'Yusei Magic', sans-serif;
    border-radius: 5px;
    height:44px;
    width: 247px;
  }

  .login-margin {
    margin:-10px;
  }

  .register-margin {
    margin: 8px;
  }

  input {
    margin: 8px 0;
    padding: 2px 0 2px 5px;
    color: #3794FF;
    font-size: 18px;
    width: 240px;
    height:30px;
    border-radius: 0px;
    border: 1px solid black;
  }
  
  .form-window {
    width: 310px;
    height:240px;
    background-color: white;
    opacity: 1;
    text-align: center;
    padding: 10px 0;
    position:relative;
    display:flex;
    flex-direction: column;
    justify-content: center;
  }

  .close {
    position:absolute;
    right: 0;
    top:0;
    padding: 6px 6px 0 0;
    cursor: pointer;
  }

  .close-margin {
    margin-top: 15px;
  }

  .register {
    margin-top: 20px;
    cursor: pointer;
  }
</style>