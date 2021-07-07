<template>
  <RouterLink
    :to="{ name: 'user-profile', params: { address } }"
    class="author"
    @mouseenter.native="mouseEnterHandler"
  >
    <Avatar :address="address" />
    <div class="author-name">
      <span class="chain-name">
        {{ name ? name : $t('FellowSuperhero') }}
      </span>
      <span class="address">
        {{ address }}
      </span>
    </div>
  </RouterLink>
</template>

<script>
import Backend from '../../utils/backend';
import Avatar from '../Avatar.vue';

export default {
  components: { Avatar },
  props: {
    address: { type: String, required: true },
  },
  data: () => ({ popupBound: false, name: null }),
  async mounted() {
    this.name = (await Backend.getProfile(this.address)).preferredChainName;
  },
  methods: {
    async mouseEnterHandler() {
      if (this.popupBound) return;
      this.popupBound = true;
      await this.$store.dispatch('modals/open', {
        name: 'user-popup',
        reference: this.$el,
        address: this.address,
      });
      this.popupBound = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.author {
  display: flex;

  &:hover {
    .avatar,
    .author-name {
      filter: brightness(1.3);
    }
  }

  .avatar {
    margin-right: 0.25rem;
    display: block;
  }

  .author-name {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;

    .address,
    .chain-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chain-name {
      font-size: 0.8rem;
      color: #fff;
    }

    .address {
      font-size: 0.65rem;
      color: $light_font_color;
    }
  }
}
</style>
