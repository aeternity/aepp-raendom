<template>
  <Menu @close="resolve">
    <ButtonPlain @click="sendReport">
      {{ $t('components.tipRecords.TipRecord.reportPost') }}
    </ButtonPlain>
    <ButtonPlain
      v-if="type === 'AE_TIP'"
      @click="claim"
    >
      {{ $t('components.tipRecords.TipRecord.claim') }}
    </ButtonPlain>
    <ButtonPlain @click="pinOrUnPinTip">
      {{ isTipPinned
        ? $t('components.tipRecords.TipRecord.UnPin')
        : $t('components.tipRecords.TipRecord.Pin')
      }}
    </ButtonPlain>
  </Menu>
</template>

<script>
import { mapState } from 'vuex';
import { createPopper } from '@popperjs/core';
import Backend from '../utils/backend';
import backendAuthMixin from '../utils/backendAuthMixin';
import Menu from './Menu.vue';
import ButtonPlain from './ButtonPlain.vue';

export default {
  components: { Menu, ButtonPlain },
  mixins: [backendAuthMixin(true)],
  props: {
    resolve: { type: Function, required: true },
    reference: { type: Element, required: true },
    id: { type: String, required: true },
    url: { type: String, default: '' },
    type: { type: String, required: true },
  },
  computed: {
    ...mapState(['address']),
    ...mapState('aeternity', ['useSdkWallet']),
    ...mapState({
      isTipPinned({ pinnedItems }) {
        return pinnedItems.some(({ id }) => id === this.id);
      },
    }),
    toTip() {
      return { name: 'tip', params: { tipId: this.id } };
    },
  },
  async mounted() {
    const popper = createPopper(this.reference, this.$el.querySelector('.modal-content'), {
      placement: 'bottom-end',
      modifiers: [{
        name: 'flip',
        options: { fallbackPlacements: ['top-end'] },
      }, {
        name: 'offset',
        options: { offset: [0, 5] },
      }],
    });
    this.$on('hook:destroy', popper.destroy);
  },
  methods: {
    async sendReport() {
      await this.backendAuth('sendPostReport', { tipId: this.id }, this.toTip);
      if (this.useSdkWallet) {
        await this.$store.dispatch('modals/open', {
          name: 'success',
          title: this.$t('components.tipRecords.TipRecord.reportPostTitle'),
          body: this.$t('components.tipRecords.TipRecord.reportPostBody'),
        });
      }
      this.resolve();
    },
    async claim() {
      try {
        await Backend.claimFromUrl({
          url: this.url,
          address: this.address,
        });
        await this.$store.dispatch('modals/open', {
          name: 'success',
          title: this.$t('components.tipRecords.TipRecord.claimTitle'),
          body: this.$t('components.tipRecords.TipRecord.claimBodySuccess'),
        });
        this.resolve();
      } catch (error) {
        await this.$store.dispatch('modals/open', {
          name: 'failure',
          title: this.$t('components.tipRecords.TipRecord.claimTitle'),
          body: this.$t('components.tipRecords.TipRecord.claimBodyFailure'),
        });
        console.error(error);
      }
    },
    async pinOrUnPinTip() {
      await this.backendAuth(
        this.isTipPinned ? 'unPinItem' : 'pinItem',
        { entryId: this.id, type: 'TIP' },
        this.toTip,
      );
      await this.$store.dispatch('updatePinnedItems');
      this.resolve();
    },
  },
};
</script>
