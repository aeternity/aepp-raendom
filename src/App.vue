<template>
  <div
    id="app"
    :class="$route.meta.layoutClass"
  >
    <MobileNavigation v-if="!$route.meta.fullScreen" />
    <div class="row">
      <div
        v-if="!$route.meta.fullScreen"
        class="sidebar-sticky"
      >
        <LeftSection />
      </div>
      <RouterView class="router-view" />
      <div
        v-if="!$route.meta.fullScreen"
        class="sidebar-sticky"
      >
        <RightSection />
      </div>
    </div>
    <Component
      :is="component"
      v-for="{ component, key, props } in opened"
      :key="key"
      v-bind="props"
    />
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';
import Backend from './utils/backend';
import { EventBus } from './utils/eventBus';
import MobileNavigation from './components/layout/MobileNavigation.vue';
import LeftSection from './components/layout/LeftSection.vue';
import RightSection from './components/layout/RightSection.vue';

export default {
  components: { MobileNavigation, LeftSection, RightSection },
  computed: {
    ...mapGetters('modals', ['opened']),
    ...mapGetters(['isLoggedIn']),
    ...mapState(['address']),
    ...mapState('aeternity', ['sdk']),
  },
  async mounted() {
    if (process.env.VUE_APP_LANDING_ENABLED
     && !this.isLoggedIn
     && this.$route.name === 'feed') {
      this.$router.push({ name: 'landing' });
    }

    EventBus.$on('reloadData', () => {
      this.reloadData();
    });
    setInterval(() => this.reloadData(), 120 * 1000);

    await this.$store.dispatch('aeternity/initSdk');
    await Promise.all([
      this.initWallet(),
      this.reloadData(),
    ]);
  },
  methods: {
    ...mapMutations([
      'setAddress', 'setChainNames', 'updateBalance',
      'setGraylistedUrls', 'setTokenInfo', 'setWordRegistry', 'setVerifiedUrls',
    ]),
    ...mapMutations('aeternity', ['useSdkWallet']),
    async reloadData() {
      const [
        chainNames, verifiedUrls, graylistedUrls, tokenInfo, wordRegistry,
      ] = await Promise.all([
        Backend.getCacheChainNames(),
        Backend.getVerifiedUrls(),
        Backend.getGrayListedUrls(),
        Backend.getTokenInfo(),
        Backend.getWordRegistry(),
        this.$store.dispatch('backend/reloadStats'),
        this.$store.dispatch('backend/reloadPrices'),
        this.$store.dispatch('fetchUserInfo'),
      ]);

      this.setChainNames(chainNames);
      this.setGraylistedUrls(graylistedUrls);
      this.setVerifiedUrls(verifiedUrls);
      this.setTokenInfo(tokenInfo || {});
      this.setWordRegistry(wordRegistry);
    },
    async initWallet() {
      let { address } = this.$route.query;
      if (!address) {
        address = await this.$store.dispatch('aeternity/scanForWallets');
        console.log('found wallet');
        this.useSdkWallet();
        this.setAddress(address);
        try {
          await this.$store.dispatch('updateCookiesConsent');
        } catch (error) {
          if (error.message !== 'Operation rejected by user') throw error;
        }
      } else {
        this.setAddress(address);
      }
      await this.$store.dispatch('fetchUserInfo');
    },
  },
  metaInfo: {
    titleTemplate: '%s - Superhero.com',
  },
};
</script>

<style lang="scss">
:root {
  --container-width: 59rem;
}

@include mobile {
  :root {
    --container-width: 100%;
  }
}

@include above-desktop-small {
  html {
    font-size: 125%;
  }
}

@include above-desktop-big {
  :root {
    --container-width: 61rem;
  }
}
</style>

<style lang="scss" scoped>
#app {
  margin: 0 auto;
  min-height: 100vh;
  max-width: var(--container-width);
  display: flex;
  flex-direction: column;

  .row {
    flex-grow: 1;
    display: flex;
    flex-wrap: nowrap;

    .sidebar-sticky {
      flex-shrink: 0;

      > div {
        position: sticky;
        top: 0;
      }

      @include mobile {
        display: none;
      }

      .left-section {
        width: 9.2rem;
        margin-right: 15px;
        padding-top: 1rem;

        @include above-desktop-big {
          margin-right: calc(15px + 1rem); // TODO: Replace with a rem value
        }
      }

      .right-section {
        padding-top: 8px;
        width: 360px;
        margin-left: calc(15px + 0.8rem); // TODO: Replace with a rem value
      }
    }

    .router-view {
      flex-grow: 1;
      min-width: 0; // https://css-tricks.com/flexbox-truncated-text/
    }
  }
}
</style>
