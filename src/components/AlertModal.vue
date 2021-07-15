<template>
  <Dialog
    class="alert-modal"
    :title="title"
    @close="resolve"
  >
    <img
      v-if="!hideIcon"
      slot="icon"
      :src="failure ? FailureIcon : SuccessIcon"
    >
    <p
      v-for="(row, index) in body instanceof Array ? body : [body]"
      :key="index"
    >
      {{ row }}
    </p>
    <AeButton @click="resolve">
      {{ primaryButtonText }}
    </AeButton>
  </Dialog>
</template>

<script>
import SuccessIcon from '../assets/verifiedUrl.svg';
import FailureIcon from '../assets/iconError.svg';
import Dialog from './Dialog.vue';
import AeButton from './AeButton.vue';

export default {
  components: { Dialog, AeButton },
  props: {
    title: { type: String, required: true },
    body: { type: [String, Array], required: true },
    resolve: { type: Function, required: true },
    failure: Boolean,
    hideIcon: Boolean,
    primaryButtonText: {
      type: String,
      default() { return this.$t('done'); },
    },
  },
  data: () => ({
    SuccessIcon,
    FailureIcon,
  }),
};
</script>

<style lang="scss" scoped>
.alert-modal {
  word-break: break-word; // TODO: move it to case where it is actually used
}
</style>
