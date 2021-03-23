<template>
  <div
    class="loader"
    :class="[{ 'has-overlay': hasOverlay }, { lg }]"
  >
    <img
      :src="animatedSpinner"
      class="svg"
    >
    <div class="progress-message">
      {{ progressMessage }}
    </div>
    <div class="message">
      {{ message }}
    </div>
  </div>
</template>

<script>
import animatedSpinner from '../assets/animatedSpinner.svg?skip-optimize';

export default {
  props: {
    hasOverlay: { type: Boolean },
    lg: { type: Boolean },
    progressMessage: { type: String, default: '' },
    message: { type: String, default: '' },
  },
  data: () => ({ animatedSpinner }),
};
</script>

<style lang="scss" scoped>
.loader {
  text-align: center;

  .progress-message {
    color: $tip_note_color;
  }

  .message {
    color: $pure_white;
  }

  .message,
  .progress-message {
    font-size: 15px;
    line-height: 19.5px;
    text-align: center;
    margin-top: 8px;
  }

  .svg {
    width: 56px;
    height: 56px;
  }

  &.lg .svg {
    width: 72px;
    height: 72px;
  }

  &.has-overlay {
    position: absolute;
    padding: 16px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    left: 0;
    top: 0;
    z-index: 3;
    background-color: $article_content_color;
  }
}
</style>
