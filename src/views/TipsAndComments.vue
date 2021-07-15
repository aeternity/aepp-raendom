<template>
  <div class="tips-and-comments">
    <BackButtonRibbon />

    <Component
      :is="id ? 'TipComment' : 'TipRecord'"
      v-if="record"
      class="record"
      v-bind="id ? record : { tip: record }"
      detailed
    />

    <div
      v-if="record"
      class="comment-section"
    >
      <p class="latest-comments">
        {{ $t('views.TipCommentsView.LatestReplies') }}
      </p>
      <SendComment
        :tip-id="tipId"
        v-bind="id && { parentId: id }"
      />
    </div>
    <div class="comments-section">
      <Loading
        v-if="showLoading"
        :above-content="!!(record && nestedComments.length)"
      />
      <template v-if="record">
        <div
          v-if="nestedComments.length === 0 && !showLoading"
          class="no-results"
          :class="{ error }"
        >
          {{ $t('views.TipCommentsView.NoResultsMsg') }}
        </div>

        <TipCommentList :comments="nestedComments" />
      </template>
    </div>
  </div>
</template>

<script>
import TipComment from '../components/tipRecords/TipComment.vue';
import TipRecord from '../components/tipRecords/TipRecord.vue';
import TipCommentList from '../components/tipRecords/TipCommentList.vue';
import BackButtonRibbon from '../components/BackButtonRibbon.vue';
import Loading from '../components/Loading.vue';
import backendAuthMixin from '../utils/backendAuthMixin';
import SendComment from '../components/SendComment.vue';
import { EventBus } from '../utils/eventBus';
import Backend from '../utils/backend';

export default {
  components: {
    Loading,
    TipRecord,
    TipCommentList,
    BackButtonRibbon,
    SendComment,
    TipComment,
  },
  mixins: [backendAuthMixin()],
  props: {
    id: { type: [String, Number], default: '' },
    tipId: { type: [String, Number], required: true },
  },
  data: () => ({
    showLoading: false,
    error: false,
  }),
  computed: {
    record() {
      return this.id
        ? this.$store.state.backend.comment[this.id]
        : this.$store.state.backend.tip[this.tipId];
    },
    nestedComments() {
      return this.id
        ? this.record.children
        : this.record.comments.filter(({ parentId }) => !parentId);
    },
  },
  async mounted() {
    EventBus.$on('reloadData', () => {
      this.reloadData();
    });

    const handler = () => this.reloadData();
    this.$watch(({ id }) => id, handler, { immediate: true });
    const interval = setInterval(handler, 120 * 1000);

    this.$once('hook:destroyed', () => {
      clearInterval(interval);
    });
  },
  methods: {
    async handleBackendSucceedCall(methodName) {
      switch (methodName) {
        case 'unPinItem':
        case 'pinItem':
          await this.$store.dispatch('updatePinnedItems');
          break;
        case 'sendPostReport':
          await this.$store.dispatch('modals/open', {
            name: 'success',
            title: this.$t('components.tipRecords.TipRecord.reportPostTitle'),
            body: this.$t('components.tipRecords.TipRecord.reportPostBody'),
          });
          break;
        default:
      }
    },
    async reloadData() {
      this.showLoading = true;
      try {
        await this.$store.dispatch(this.id
          ? 'backend/reloadComment' : 'backend/reloadTip', this.id || this.tipId);
      } catch (error) {
        this.error = true;
        console.error(error);
      } finally {
        this.showLoading = false;
      }
    },
  },
  metaInfo() {
    if (!this.record) return { title: 'Loading' };
    const { title, description, author } = {
      tip: {
        title: `Tip ${this.tipId.split('_')[0]}`,
        description: this.record.text,
        author: this.record.author,
      },
      comment: {
        title: 'Comment',
        description: this.record.title,
        sender: this.record.sender,
      },
    }[this.$route.name];
    const image = this.record.media?.[0] ?? Backend.getProfileImageUrl(author);

    return {
      title,
      meta: [
        { property: 'og:image', content: image },
        { property: 'og:url', content: window.location.href.split('?')[0] },
        { property: 'og:title', content: `Superhero ${title}` },
        { property: 'og:description', content: description },
        { property: 'og:site_name', content: 'Superhero' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:site', content: '@superhero_chain' },
        { name: 'twitter:creator', content: '@superhero_chain' },
        { name: 'twitter:image:alt', content: 'Superhero post' },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.tips-and-comments {
  color: $light_font_color;
  font-size: 0.75rem;

  .record {
    margin-bottom: 0;
    background-color: $thumbnail_background_color;
  }

  .comments-section {
    background-color: $thumbnail_background_color;
    padding: 1rem;
    position: relative;
  }

  .no-results {
    color: $standard_font_color;
    font-size: 0.75rem;
    text-align: center;

    &.error {
      color: $red_color;
    }
  }

  .comment-section {
    background-color: $thumbnail_background_color;
    padding: 0.75rem 1rem 0 1rem;

    p {
      font-size: 0.75rem;
      text-transform: capitalize;
      margin-top: 0;
      margin-bottom: 0.7rem;
      color: white;
      font-weight: 600;
    }
  }
}
</style>
