<template>
  <form
    class="send-comment"
    @submit.prevent="sendTipComment"
  >
    <MessageInput
      v-model="comment"
      :placeholder="$t('views.TipCommentsView.AddReply')"
      :show-submit-button="allowSubmit"
      :submit-button-title="$t('views.TipCommentsView.Reply')"
      :loading="loading"
      @keydown.enter.exact.prevent="sendTipComment"
    />
  </form>
</template>

<script>
import MessageInput from './MessageInput.vue';

export default {
  components: { MessageInput },
  props: {
    tipId: { type: String, required: true },
    parentId: { type: [Number, String], default: undefined },
  },
  data: () => ({
    comment: '',
    loading: false,
  }),
  computed: {
    allowSubmit() {
      return this.comment.trim().length > 0;
    },
  },
  methods: {
    async sendTipComment() {
      if (!this.allowSubmit) return;
      this.loading = true;
      try {
        await this.$store.dispatch(
          'backend/sendComment',
          { text: this.comment, tipId: this.tipId, parentId: this.parentId },
        );
        this.comment = '';
      } catch (error) {
        if (error.message !== 'Operation rejected by user') throw error;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
