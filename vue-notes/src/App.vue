<template>
  <Popup :type="popupType" :message="popupMessage" :hidden="hidePopup" 
          @hide="closePopup"></Popup>
  <User :hidden="hideUser" :url="url" @user="setUser" @type="setUserType"
        :type="typeUser" :email="user ? user.email : null"
        @hide="closeUser" @error="showPopup"></User>
</template>

<script>
import Popup from './components/Popup.vue'
import User from './components/User.vue'

export default {
  name: 'App',
  components: {
    User, Popup
  },
  data() {
    return {
      hideUser: false,
      typeUser: 'Login',
      hidePopup: true,
      popupType: 'Error',
      popupMessage: 'This is a test message',
      user: null,
      url: 'http://localhost:8081'
    }
  },
  methods: {
    setUser(user) {
      this.user = user
      localStorage.setItem('id', user._id)
      localStorage.setItem('email', user.email)
    },
    setUserType(type) {
      this.typeUser = type
    },
    closeUser() {
      this.hideUser = true
    },
    showPopup(type, message) {
      this.popupType = type
      this.popupMessage = message
      this.hidePopup = false
    },
    closePopup(interval) {
      const self = this
      window.setTimeout(function(){
        self.hidePopup = true
      }, interval)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Noto Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
