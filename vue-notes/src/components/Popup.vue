<template>
  <div ref="popup" class="popup" :style="{top: top}" @click="$emit('hide',0)">
    <h2 :class="[ type.toLowerCase() ]">{{ type }}</h2>
    <span :class="[ type.toLowerCase() ]">{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'Popup',
  props: {
    message: String,
    type: String,
    hidden: Boolean
  },
  emits: ['hide'],
  data() {
    return {
      
    }
  },
  computed: {
    top() {
      if(this.hidden) {
        if(this.$refs.popup) {
          const t = - this.$refs.popup.clientHeight - 10
          return t.toString() + 'px'
        } else {
          return '-70px'
        }
      } else {
        return '0'
      }
    }
  },
  watch: {
    top(val) {
      if(val === '0') {
        this.$emit('hide',4000)
      }
    }
  }
}
</script>

<style scoped>
  .hide {
    top: 0px;
  }

  .info {
    color: hsl(204, 86%, 53%);
  }

  .success {
    color: hsl(141, 71%, 48%);
  }

  .warning {
    color: hsl(48, 100%, 67%);
  }

  .error {
    color: hsl(348, 100%, 61%)
  }

  .popup {
    z-index: 1;
    width: 100vw;
    height:auto;
    background-color: white;
    position:fixed;
    transition: top 2s;
    padding-bottom: 10px;
  }

  h2 {
    margin: 0;
  }
</style>