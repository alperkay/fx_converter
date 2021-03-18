<template>
  <select @change="$emit('input', $event.target.value)" class="select">
    <option
      :selected="value === currency"
      v-for="currency in currencies"
      :key="currency"
      :value="currency"
      >{{ currency }}</option
    >
  </select>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "CurrencySelect",
  props: ["value", "currencies"]
});
</script>

<style lang="scss">
.select {
  padding: 0 5px;
  height: 2rem;
  width: 100%;
  max-width: 150px;
  min-width: 135px;
  font-size: 1.2rem;
  border: 1.7px solid gray;
  border-radius: 2px;
  border-top: 1px solid rgb(168, 168, 168);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  cursor: pointer;
  &:hover {
    border: 2px solid rgb(223, 201, 141);
  }
}
</style>
