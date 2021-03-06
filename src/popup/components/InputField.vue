<template>
  <div class="grid focus-within:text-primary-700" style="display: grid; grid-template-areas: 'bar'; grid-template-columns: 1fr auto; grid-template-rows: 30px">
    <input
        ref="input"
        v-model="internal"
        class="w-full rounded focus:border-primary-500 focus:ring focus:ring-primary-700 focus:ring-opacity-50"
        autofocus
        style="grid-area: bar"
        :placeholder="placeholder"
        :type="type"
        v-bind="$attrs"
        @keydown.stop
        @keypress.stop
    />
    <div class="justify-self-end self-center mr-2 text" :class="{'mr-2': type === 'text', 'mr-10': type === 'number'}" style="grid-area: bar">
      <fa v-if="internal || placeholderIcon === ''" icon="times" class="h-icon-sm hover:cursor-pointer hover:text-destructive-icon" @click="clear" />
      <fa v-else :icon="placeholderIcon" class="h-icon-sm" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: [String, Number],
      required: true
    },
    placeholderIcon: {
      type: String as PropType<string>,
      required: false,
      default: ''
    },
    placeholder: {
      type: String as PropType<string>,
      required: false,
      default: ''
    },
    type: {
      type: String as PropType<string>,
      required: false,
      default: 'text'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const internal = computed({
      get: () => props.modelValue ?? '',
      set: (val) => emit('update:modelValue', val)
    });
    const input = ref<HTMLInputElement | null>(null);

    return {
      input,
      internal,
      clear: () => {
        internal.value = '';
        input.value?.focus();
      }
    };
  }
});
</script>

<style>

input[type=number]::-webkit-inner-spin-button {
  opacity: 1
}
input[type=range]:focus,input[type=range]:active,input[type=range] {
  -webkit-appearance: none;
  border: none;
  background-color: transparent;
  outline: none;
}

input[type=range]::-webkit-slider-runnable-track {
  height: 1px;
  background: #374151;
  border: none;
  border-radius: 3px;
}

input[type=range]::-moz-range-track {
  height: 1px;
  background: #374151;
  border: none;
  border-radius: 3px;
}

input[type=range]::-moz-range-thumb {
  -webkit-appearance: none;
  border: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #0e7490;
  margin-top: -6px;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #0e7490;
  margin-top: -6px;
}

</style>
