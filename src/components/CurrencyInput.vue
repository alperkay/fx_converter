<template>
  <input
    type="number"
    :value="isLoading ? null : value"
    ref="input"
    @input="$emit('input', $event.target.value)"
    @focus="$refs['input'].select()"
    @keydown="validate"
    class="input"
    pattern="/^\d*\.?\d*$/"
    step="any"
  />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "CurrencyInput",
  props: ["value", "isLoading"],
  methods: {
    validate(e: KeyboardEvent) {
      if (
        [
          "Backspace",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown"
        ].includes(e.key)
      ) {
        return;
      }
      if (!/^\d*\.?\d*$/.test(e.key)) {
        e.preventDefault();
      }
    }
  }
});
</script>

<style lang="scss">
.input {
  padding: 0 10px;
  width: 100%;
  max-width: 150px;
  min-width: 135px;
  height: 2rem;
  font-size: 1.2rem;
  border: 1.7px solid gray;
  border-radius: 2px;
  border-bottom: none;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
