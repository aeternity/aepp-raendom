<template>
  <div class="sound-cloud-embed">
    <img :src="tipPreviewImage">
    <TipUrlDetails
      :source="sourceUrl"
      :title="tipPreviewTitle"
      :description="tipPreviewDescription"
    >
      <a
        :href="tipUrl"
        target="_blank"
      />
      <PlayButton
        v-if="!isPlaying"
        @click="isAllowed
          ? isPlaying = true
          : $store.dispatch('modals/open', {
            name: 'cookies-dialog',
            reference: $el,
            scope: 'SoundCloud',
          })"
      />
      <SoundCloudPlayer
        v-else-if="isPlaying && isAllowed"
        :tip-url="tipUrl"
      />
    </TipUrlDetails>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import SoundCloudPlayer from './SoundCloudPlayer.vue';
import TipUrlDetails from './TipUrlDetails.vue';
import PlayButton from '../PlayButton.vue';

export default {
  components: {
    SoundCloudPlayer, TipUrlDetails, PlayButton,
  },
  props: {
    tipUrl: { type: String, required: true },
    tipPreviewTitle: { type: String, required: true },
    tipPreviewDescription: { type: String, required: true },
    tipPreviewImage: { type: String, required: true },
    sourceUrl: { type: String, default: '' },
  },
  data() {
    return {
      isPlaying: false,
    };
  },
  computed: mapState({
    isAllowed: (state) => state.cookiesConsent.SoundCloud,
  }),
};
</script>

<style lang="scss" scoped>
.sound-cloud-embed {
  display: flex;
  position: relative;

  img {
    width: 35%;
    object-fit: cover;

    @include smallest {
      max-height: 150px;
    }
  }

  .tip-url-details {
    min-width: 0;

    ::v-deep .description {
      @include truncate-overflow-mx(3);
    }

    a::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .play-button,
    .sound-cloud-player {
      position: relative;
    }
  }
}
</style>
