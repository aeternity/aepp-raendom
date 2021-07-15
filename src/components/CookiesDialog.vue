<template>
  <div class="cookies-dialog">
    <ButtonPlain
      class="button-cancel"
      @click="resolve"
    >
      <IconCancel />
    </ButtonPlain>
    <CookieImg class="cookie-img" />
    <div class="info">
      Superhero.com respects your privacy. Third-party tracking cookies are blocked by default.
      In order to play content such as video or audio
      you have to allow third-party cookies by content provider.
    </div>
    <div>
      <ButtonPlain
        class="cookies-button"
        @click="allowHandler"
      >
        Allow {{ scope }}
      </ButtonPlain>
      <ButtonPlain
        v-if="address"
        class="cookies-button"
        :to="{ name: 'user-profile', params: { address } }"
      >
        Customize policy
      </ButtonPlain>
    </div>
  </div>
</template>

<script>
import { createPopper } from '@popperjs/core';
import { mapState } from 'vuex';
import ButtonPlain from './ButtonPlain.vue';
import CookieImg from '../assets/cookieImg.svg?icon-component';
import IconCancel from '../assets/iconCancel.svg?icon-component';

export default {
  components: { ButtonPlain, CookieImg, IconCancel },
  props: {
    resolve: { type: Function, required: true },
    reference: { type: Element, required: true },
    scope: { type: String, required: true },
  },
  computed: mapState(['address']),
  mounted() {
    this.popper = createPopper(this.reference, this.$el, {
      placement: 'bottom-start',
      modifiers: [{
        name: 'flip',
        enabled: false,
      }, {
        name: 'sameWidth',
        enabled: true,
        phase: 'beforeWrite',
        requires: ['computeStyles'],
        fn: ({ state }) => {
          state.styles.popper.width = `${state.rects.reference.width}px`;
          state.styles.popper.top = `-${state.rects.reference.height}px`;
        },
        effect: ({ state }) => {
          state.elements.popper.style.width = `${
            state.elements.reference.offsetWidth
          }px`;
        },
      }],
    });
  },
  methods: {
    async allowHandler() {
      try {
        await this.$store.dispatch('backend/setCookies', { scope: this.scope, status: true });
        this.resolve();
      } catch (error) {
        if (error.message !== 'Operation rejected by user') throw error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.cookies-dialog {
  background-color: $buttons_background;
  border: 1px solid $article_content_color;
  border-radius: 0.25rem;
  padding: 0.9rem;
  box-shadow: 4px 4px 4px 0 rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;

  .button-cancel {
    position: absolute;
    right: 0;
    top: 0;
    color: $tip_note_color;

    svg {
      height: 1.9rem;
    }
  }

  .cookie-img {
    height: 2.5rem;
  }

  .info {
    padding: 0.8rem 0;
    text-align: center;
  }

  .cookies-button {
    border: 1px solid $secondary_color;
    border-radius: 0.25rem;
    font-weight: 500;
    color: $secondary_color;
    padding: 0.35rem 0.7rem;
    background-color: $buttons_background;
    margin: 0.5rem 0.5rem 0 0;

    &:hover {
      background-color: #1161fe50;
    }
  }
}
</style>
