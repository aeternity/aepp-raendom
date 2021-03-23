<template>
  <div
    class="dropdown"
    :class="{ right: showRight, 'read-only': !method }"
  >
    <ButtonPlain
      :class="{ active: showMenu }"
      @click.prevent="showMenu = true"
    >
      <slot
        name="displayValue"
        :displayValue="currentValue"
      />
      <span v-if="!$slots.displayValue">{{ displayValue }}</span>
      <img src="../assets/caretDown.svg">
    </ButtonPlain>
    <Modal
      v-if="showMenu"
      @close="showMenu = false"
    >
      <Component
        :is="method ? ButtonPlain : 'div'"
        v-for="option in options"
        :key="option.value"
        class="dropdown-item"
        @click="selectItem(option)"
      >
        <slot :option="option">
          {{ option.text }}
        </slot>
      </Component>
    </Modal>
  </div>
</template>

<script>
import Modal from './Modal.vue';
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: {
    Modal,
    ButtonPlain,
  },
  props: {
    options: { type: Array, default: null },
    selected: { type: [String, Number], default: null },
    method: { type: Function, default: null },
    showRight: { type: Boolean },
  },
  data() {
    return {
      showMenu: false,
      currentValue: this.options[0],
      ButtonPlain,
    };
  },
  computed: {
    displayValue() {
      if (!this.selected) {
        return this.options[0].text || '';
      }
      const selectedOption = this.options.find((option) => option.value === this.selected);
      return selectedOption ? selectedOption.text : '';
    },
  },
  methods: {
    selectItem(option) {
      if (this.method) {
        this.currentValue = option;
        this.method(option);
      }
      this.showMenu = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.dropdown {
  position: relative;
  display: inline-block;
  vertical-align: middle;

  > button {
    display: flex;
    align-items: center;
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
    color: $standard_font_color;
    border-radius: 2.5rem;

    &.active {
      background-color: $article_content_color;
    }
  }

  .dropdown-item {
    font-size: 0.75rem;
    min-width: 6.5rem;
    padding: 0.4rem 0.8rem;
    background-color: $actions_ribbon_background_color;
    color: $standard_font_color;
    box-shadow: inset 0 0 0.1rem $article_content_color;
    border-radius: unset;

    &:first-child {
      border-radius: 0.15rem 0.15rem 0 0;
    }

    &:last-child {
      border-radius: 0 0 0.15rem 0.15rem;
    }

    &:hover {
      background-color: $background_color;
    }
  }

  ::v-deep button {
    padding: 0;
  }

  &::v-deep .not-bootstrap-modal-content {
    max-height: 10rem;
    overflow-y: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      scrollbar-width: none;
      display: none;
    }
  }

  &.right::v-deep .not-bootstrap-modal-content {
    right: 0;
  }

  &.read-only .dropdown-item {
    cursor: initial;

    &:hover {
      background-color: $actions_ribbon_background_color;
    }
  }
}
</style>
