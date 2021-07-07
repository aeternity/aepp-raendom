<template>
  <div class="send-tip">
    <div v-if="showForm">
      <div class="label-close">
        <ButtonPlain
          :title="$t('close')"
          @click="toggleForm"
        >
          <IconClose />
        </ButtonPlain>
      </div>
      <SendPost v-if="post" />
      <form
        v-else
        @submit.prevent="sendTip"
      >
        <MessageInput
          v-model="sendTipForm.title"
          maxlength="280"
          :placeholder="$t('addMessage')"
        />
        <div class="row">
          <div class="url-input">
            <UrlStatus
              :url="sendTipForm.url"
              @is-blacklisted-url="isBlacklistedUrl = $event"
            />
            <input
              v-model.trim="sendTipForm.url"
              :placeholder="$t('components.layout.SendTip.EnterURL')"
            >
          </div>
          <AeInputAmount
            v-model="sendTipForm.amount"
            :select-token-f="(token) => inputToken = token"
          />
          <AeButton
            :disabled="!isSendTipDataValid"
            :loading="sendingTip"
          >
            <IconDiamond /> <span>{{ $t('tip') }}</span>
          </AeButton>
        </div>
      </form>
    </div>
    <MessageInput
      v-else
      class="closed-view"
      :placeholder="post ?
        'Create New Post' :
        $t('components.layout.SendTip.SendNewTip')"
      @focus="useSdkWallet ? toggleForm() : openTipDeeplink()"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import AeInputAmount from '../../AeInputAmount.vue';
import { createDeepLinkUrl, shiftDecimalPlaces, validateTipUrl } from '../../../utils';
import { EventBus } from '../../../utils/eventBus';
import AeButton from '../../AeButton.vue';
import ButtonPlain from '../../ButtonPlain.vue';
import IconDiamond from '../../../assets/iconDiamond.svg?icon-component';
import IconClose from '../../../assets/iconClose.svg?icon-component';
import MessageInput from '../../MessageInput.vue';
import UrlStatus from './UrlStatus.vue';
import SendPost from './SendPost.vue';

export default {
  components: {
    AeInputAmount,
    AeButton,
    ButtonPlain,
    MessageInput,
    UrlStatus,
    IconDiamond,
    IconClose,
    SendPost,
  },
  props: { post: Boolean },
  data() {
    return {
      inputToken: null,
      sendTipForm: {
        amount: 0,
        url: '',
        title: '',
      },
      sendingTip: false,
      isBlacklistedUrl: false,
      showForm: false,
    };
  },
  computed: {
    ...mapGetters('backend', ['minTipAmount']),
    ...mapState(['tokenInfo']),
    ...mapState('aeternity', ['useSdkWallet']),

    isTipAmountValid() {
      return this.inputToken !== null || (this.sendTipForm.amount > this.minTipAmount);
    },
    isSendTipDataValid() {
      // TODO: better validation
      return this.isTipAmountValid
          && this.sendTipForm.url.length > 0
          && this.sendTipForm.title.length > 0
          && validateTipUrl(this.sendTipForm.url)
          && !this.isBlacklistedUrl;
    },
  },
  methods: {
    async sendTip() {
      this.sendingTip = true;
      const amount = shiftDecimalPlaces(this.sendTipForm.amount,
        this.inputToken !== null ? this.tokenInfo[this.inputToken].decimals : 18).toFixed();

      try {
        await this.$store.dispatch('aeternity/tip', {
          url: this.sendTipForm.url,
          title: this.sendTipForm.title,
          amount,
          tokenAddress: this.inputToken,
        });
        this.clearTipForm();
        this.$store.dispatch('modals/open', {
          name: 'success',
          title: this.$t('components.layout.SendTip.SuccessHeader'),
          body: this.$t('components.layout.SendTip.SuccessText'),
        });
        EventBus.$emit('reloadData');
      } catch (error) {
        if (error.code && error.code === 4) {
          return;
        }
        console.error(error);
        this.$store.dispatch('modals/open', {
          name: 'failure',
          title: this.$t('components.layout.SendTip.ErrorHeader'),
          body: this.$t('components.layout.SendTip.ErrorText'),
        });
      } finally {
        this.sendingTip = false;
      }
    },
    clearTipForm() {
      this.sendTipForm = { amount: 0, url: '', title: '' };
      this.sendingTip = false;
    },
    toggleForm() {
      this.showForm = !this.showForm;
      this.clearTipForm();
    },
    openTipDeeplink() {
      window.location = createDeepLinkUrl({ type: 'tips' });
    },
  },
};
</script>

<style lang="scss" scoped>
.send-tip {
  background-color: $actions_ribbon_background_color;

  .label-close {
    display: flex;
    padding: 7.5px 10px;
    background-color: $light_color;

    .button-plain {
      font-size: 16px;
      color: $standard_font_color;
      margin-left: auto;

      &:hover {
        opacity: 0.6;
      }

      svg {
        display: block;
        width: 17px;
      }
    }
  }

  form {
    padding: 12px 20px 0 20px;

    .row {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 8px 0 16px 0;

      .url-input,
      .ae-input-amount {
        flex-basis: 0;
        margin-right: 6px;
      }

      .url-input {
        @include input-like;

        flex-grow: 1;
        display: flex;
        align-items: center;

        .url-status {
          height: 18px;
          margin: 0 6px;
        }

        input {
          padding-left: 0;
          padding-right: 0;
          width: 100%;
        }
      }

      .ae-input-amount {
        flex-grow: 1.5;

        ::v-deep input {
          padding-left: 6px;
          padding-right: 0;
        }
      }

      .ae-button {
        svg,
        span {
          vertical-align: middle;
        }

        svg {
          height: 22px;
        }
      }
    }
  }

  .closed-view.message-input {
    padding: 20px;
  }
}
</style>
