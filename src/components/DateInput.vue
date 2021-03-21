<template>
  <input
    type="date"
    :value="value"
    :min="min"
    :max="max"
    @input="$emit('input', $event.target.value)"
    placeholder="yyyy-mm-dd"
    class="date-input"
  />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "DateInput",
  props: ["value", "min", "max"]
});
</script>

<style lang="scss" scoped>
.date-input {
  width: 185px;
  padding: 0 5px;
  line-height: 2rem;
  font-size: 1rem;
  border: 1.7px solid gray;
  border-radius: 2px;
  cursor: pointer;
}
</style>
