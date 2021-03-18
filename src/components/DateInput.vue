<template>
  <input
    type="date"
    :value="value"
    min="1999-01-04"
    :max="today"
    @input="$emit('input', $event.target.value)"
    placeholder="yyyy-mm-dd"
    class="date-input"
  />
</template>

<script lang="ts">
import Vue from "vue";
import { formatDate } from "../utils/date-utils";

export default Vue.extend({
  name: "DateInput",
  props: ["value"],
  computed: {
    today() {
      return formatDate(new Date());
    }
  }
});
</script>

<style lang="scss" scoped>
.date-input {
  padding: 0 5px;
  line-height: 2rem;
  font-size: 1rem;
  border: 1.7px solid gray;
  border-radius: 2px;
  cursor: pointer;
}
</style>
