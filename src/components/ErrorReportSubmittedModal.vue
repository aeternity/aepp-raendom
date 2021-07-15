<template>
  <Dialog
    class="error-report-submitted-modal"
    :title="$t('reportBug.Success.Title')"
    :subtitle="$t('reportBug.Success.SubTitle')"
    @close="resolve"
  >
    <img
      slot="icon"
      src="../assets/iconThumbUp.svg"
    >
    {{ $t('reportBug.Success.Description') }}
    <AeButton @click="resolve">
      {{ $t('reportBug.Success.Return') }}
    </AeButton>
  </Dialog>
</template>

<script>
import Dialog from './Dialog.vue';
import AeButton from './AeButton.vue';

export default {
  components: { Dialog, AeButton },
  props: {
    resolve: { type: Function, required: true },
  },
};
</script>

<style lang="scss" scoped>
.error-report-submitted-modal .ae-button {
  margin-top: 40px;
}
</style>
