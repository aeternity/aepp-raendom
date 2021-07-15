<template>
  <!-- TODO: rename to Modal, Modal rename to Popup or so -->
  <div
    class="dialog"
    @click.self="$emit('close')"
  >
    <div class="content">
      <ButtonPlain
        class="close"
        @click="$emit('close')"
      >
        <IconCancel />
      </ButtonPlain>

      <div
        v-if="$slots.icon"
        class="icon"
      >
        <slot name="icon" />
      </div>
      <h1>{{ title }}</h1>
      <h2 v-if="subtitle">
        {{ subtitle }}
      </h2>
      <slot />
    </div>
  </div>
</template>

<script>
import ButtonPlain from './ButtonPlain.vue';
import IconCancel from '../assets/iconCancel.svg?icon-component';

export default {
  components: { ButtonPlain, IconCancel },
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  },
};
</script>

<style lang="scss" scoped>
.dialog {
  position: fixed;
  z-index: 9998;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  background-color: rgba(0, 0, 0, 0.5);

  .content {
    text-align: center;
    width: 25rem;
    margin: auto;
    padding: 40px 32px;
    background-color: $actions_ribbon_background_color;
    border-radius: 0.25rem;
    border: 1px solid $card_border_color;
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.25);
    font-size: 15px;
    line-height: 24px;
    color: $tip_note_color;
    position: relative;

    @include smallest {
      width: 100%;
      padding: 1rem;
    }

    .close {
      position: absolute;
      top: 8px;
      right: 8px;
      color: $light_font_color;

      &:hover {
        color: #fff;
      }

      svg {
        height: 32px;
      }
    }

    .icon {
      img,
      svg {
        display: block;
        margin: 0 auto 8px auto;
        height: 48px;
      }
    }

    h1,
    h2 {
      margin-top: 0;
      color: $standard_font_color;
      font-weight: 500;
    }

    h1 {
      font-size: 19px;
      line-height: 22px;
      margin-bottom: 24px;
    }

    h2 {
      font-size: 15px;
      line-height: 24px;
      margin-bottom: 8px;
    }
  }
}
</style>
