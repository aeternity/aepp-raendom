<template>
  <form
    class="send-post"
    @submit.prevent
  >
    <MessageInput
      v-model="title"
      maxlength="280"
      :placeholder="$t('What are your thoughts?')"
    />
    <MediaRow
      v-if="media.length"
      :media="media.map(({ link }) => link)"
      delete-btn
      @get-index="deleteImage($event)"
    />
    <GiphySearch
      v-if="showGifs"
      @add-gif="media.push({ link: $event })"
    />
    <div class="row">
      <div class="actions">
        <label>
          <IconPictures />
          <input
            type="file"
            name="upload-image"
            accept="image/png, image/jpeg, image/gif"
            @change="uploadImage($event)"
          >
        </label>
        <ButtonPlain
          :class="{ active: showGifs }"
          @click="showGifs = !showGifs"
        >
          <IconGif />
        </ButtonPlain>
        <template v-if="UNFINISHED_FEATURES">
          <ButtonPlain disabled>
            <IconEmoji />
          </ButtonPlain>
          <ButtonPlain disabled>
            <IconPoll />
          </ButtonPlain>
          <ButtonPlain disabled>
            <IconThreeDots />
          </ButtonPlain>
        </template>
      </div>
      <AeButton
        :loading="sendingPost || uploadingMedia"
        :disabled="!title"
        @click="sendPost"
      >
        <IconPosts /> <span>{{ $t('Post') }}</span>
      </AeButton>
    </div>
  </form>
</template>

<script>
import { mapState } from 'vuex';
import { fetchJson } from '../../../utils';
import { EventBus } from '../../../utils/eventBus';
import Backend from '../../../utils/backend';
import MessageInput from '../../MessageInput.vue';
import ButtonPlain from '../../ButtonPlain.vue';
import AeButton from '../../AeButton.vue';
import IconPictures from '../../../assets/iconPictures.svg?icon-component';
import IconGif from '../../../assets/iconGif.svg?icon-component';
import IconEmoji from '../../../assets/iconEmoji.svg?icon-component';
import IconPoll from '../../../assets/iconPoll.svg?icon-component';
import IconThreeDots from '../../../assets/iconThreeDots.svg?icon-component';
import IconPosts from '../../../assets/iconPosts.svg?icon-component';
import GiphySearch from './GiphySearch.vue';
import MediaRow from '../../MediaRow.vue';

export default {
  components: {
    MessageInput,
    ButtonPlain,
    AeButton,
    IconPictures,
    IconGif,
    IconEmoji,
    IconPoll,
    IconThreeDots,
    IconPosts,
    GiphySearch,
    MediaRow,
  },
  data() {
    return {
      title: '',
      media: [],
      sendingPost: false,
      uploadingMedia: false,
      showGifs: false,
      UNFINISHED_FEATURES: process.env.UNFINISHED_FEATURES,
    };
  },
  computed: mapState(['address', 'balance']),
  methods: {
    async sendPost() {
      this.sendingPost = true;
      const data = {
        title: this.title,
        media: this.media.map((i) => i.link),
      };

      try {
        if (+this.balance === 0) {
          await this.postWithZeroBalance(data.title, data.media);
        } else {
          await this.$store.dispatch('aeternity/postWithoutTip', { title: data.title, media: data.media });
        }
        this.clearPostForm();
        this.$store.dispatch('modals/open', {
          name: 'success',
          title: this.$t('components.layout.SendTip.SuccessHeader'),
          body: 'Post sent!',
        });
        EventBus.$emit('reloadData');
      } catch (error) {
        console.error(error);
        this.$store.dispatch('modals/open', {
          name: 'failure',
          title: this.$t('components.layout.SendTip.ErrorHeader'),
          body: 'Post not sent, please try again',
        });
      } finally {
        this.sendingPost = false;
      }
    },
    async postWithZeroBalance(title, media) {
      const signature = await this.$store.dispatch(
        'aeternity/postWithoutTipSignature',
        { title, media },
      );
      return Backend.sendPostWithoutTip({
        author: this.address,
        title,
        media,
        signature,
      });
    },
    async uploadImage(event) {
      this.uploadingMedia = true;

      const formData = new FormData();
      formData.append('image', event.target.files[0]);
      try {
        const { data } = await fetchJson('https://api.imgur.com/3/image.json', {
          method: 'post',
          body: formData,
          headers: {
            Authorization: `Client-ID ${process.env.VUE_APP_IMGUR_API_CLIENT_ID}`,
          },
        });
        this.media.push({ link: data.link, deletehash: data.deletehash });
      } finally { this.uploadingMedia = false; }
    },
    async deleteImage(index) {
      if (this.media[index].deletehash) {
        await fetch(`https://api.imgur.com/3/image/${this.media[index].deletehash}`, {
          method: 'delete',
          headers: {
            Authorization: `Client-ID ${process.env.VUE_APP_IMGUR_API_CLIENT_ID}`,
          },
        });
      }

      this.media.splice(index, 1);
    },
    clearPostForm() {
      this.title = '';
      this.media = [];
      this.sendingPost = false;
      this.uploadingMedia = false;
      this.showGifs = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.send-post {
  overflow: hidden;

  .row {
    display: flex;
    flex-direction: row;
    margin: 0.5rem 0 1rem 0;

    .actions {
      flex-grow: 1;

      svg {
        height: 2rem;
      }

      input[type="file"] {
        display: none;
      }

      .button-plain {
        &:hover {
          background-color: $light_color;
          border-radius: 100%;
        }

        &.active {
          color: $text_content_color;
        }
      }

      label {
        cursor: pointer;
        margin-bottom: 0; // TODO: Remove after dropping Bootstrap
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
</style>
