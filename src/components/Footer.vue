<template>
  <footer class="footer">
    <div v-if="isLoading"><span>&#9203;</span>Loading...</div>

    <div class="footer__error-section" v-if="errors.length">
      <div v-for="(error, index) in errors" :key="index">
        <span>&#128227;</span>{{ error }}
      </div>
    </div>
    <div class="footer__message-section" v-if="message">
      <span>&#9888;&#65039;</span>{{ message }}
    </div>
  </footer>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Footer",
  props: ["errors", "isLoading", "message"]
});
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &__message-section,
  &__error-section {
    font-size: 0.7rem;
  }

  &__error-section {
    color: #f56c6c;
  }

  &__message-section {
    color: #e6a23c;
  }
}
</style>
