<template>
  <Modal
    class="tip-input-popup"
    @close="resolve"
  >
    <div
      v-if="error || v1TipWarning"
      class="error"
    >
      {{ v1TipWarning
        ? $t('components.TipInput.v1TipWarning')
        : $t('components.TipInput.error') }}
    </div>
    <form @submit.prevent="sendTip">
      <Input
        v-if="!isRetippable"
        v-model="message"
        class="message"
        maxlength="280"
        :placeholder="$t('addMessage')"
      />
      <div class="row">
        <AeInputAmount
          v-model="inputValue"
          :select-token-f="token => (inputToken = token)"
        />
        <AeButton
          :disabled="!isValid || v1TipWarning"
          :loading="showLoading"
        >
          {{ isRetippable ? $t('retip') : $t('tip') }}
        </AeButton>
      </div>
    </form>
  </Modal>
</template>

<script>
import { createPopper } from '@popperjs/core';
import { mapState, mapGetters } from 'vuex';
import { shiftDecimalPlaces } from '../utils';
import Input from './Input.vue';
import AeInputAmount from './AeInputAmount.vue';
import AeButton from './AeButton.vue';
import Modal from './Modal.vue';

export default {
  components: {
    Input,
    AeInputAmount,
    AeButton,
    Modal,
  },
  props: {
    resolve: { type: Function, required: true },
    reference: { type: Element, required: true },
    tip: { type: Object, default: null },
    tipUrl: { type: String, required: true },
  },
  data: () => ({
    inputValue: 0,
    inputToken: null,
    showLoading: false,
    error: false,
    message: '',
  }),
  computed: {
    ...mapState(['tokenInfo']),
    ...mapGetters('backend', ['minTipAmount']),
    v1TipWarning() {
      return (
        this.tip
        && this.tip.id.split('_')[1] === 'v1'
        && this.inputToken !== null
      );
    },
    isRetippable() {
      return this.tip && this.tip.type !== 'POST_WITHOUT_TIP';
    },
    isValid() {
      return (
        (this.tip || this.message.trim().length > 0)
        && (
          (this.inputToken !== null && this.inputValue > 0)
          || this.inputValue > this.minTipAmount
        )
      );
    },
  },
  mounted() {
    const popper = createPopper(this.reference, this.$el.querySelector('.modal-content'), {
      placement: 'bottom-start',
      modifiers: [{
        name: 'flip',
        options: { fallbackPlacements: ['top-start'] },
      }, {
        name: 'offset',
        options: { offset: [0, 5] },
      }],
    });
    this.$on('hook:destroy', popper.destroy);
  },
  methods: {
    async sendTip() {
      if (!this.isValid) return;
      this.showLoading = true;
      try {
        const amount = shiftDecimalPlaces(
          this.inputValue,
          this.inputToken !== null
            ? this.tokenInfo[this.inputToken].decimals
            : 18,
        ).toFixed();

        if (!this.isRetippable) {
          await this.$store.dispatch('aeternity/tip', {
            url: this.tipUrl,
            title: this.message,
            amount,
            tokenAddress: this.inputToken,
          });
        } else {
          await this.$store.dispatch('aeternity/retip', {
            contractAddress: this.tip.contractId,
            id: this.tip.id,
            amount,
            tokenAddress: this.inputToken,
          });
        }
        this.resolve(true);
      } catch (error) {
        this.error = true;
        console.error(error);
      } finally {
        this.showLoading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.tip-input-popup.modal {
  ::v-deep .modal-content {
    background-color: $article_content_color;
    border-radius: 0.25rem;
    padding: 1rem;

    @include smallest {
      padding: 0.5rem;
    }
  }

  .modal-content {
    .error {
      text-align: center;
      font-size: 12px;
      color: $red_color;
    }

    .message {
      display: block;
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .row {
      display: flex;

      .ae-input-amount ::v-deep input {
        max-width: 120px;
      }

      .ae-button {
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
