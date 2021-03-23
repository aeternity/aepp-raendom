<template>
  <div class="word-bazaar">
    <BackButtonRibbon hide-back>
      <template #title>
        <span class="activity">
          {{ title }}
        </span>
        <span class="activity-bubble">
          <BubbleArrow />
          <Component
            :is="headerIcon"
            class="activity-icon"
          />
        </span>
      </template>
    </BackButtonRibbon>

    <ActivityRibbon
      :tabs="[]"
      value=""
    >
      <template slot="left">
        <FilterButton :to="{ name: 'word-bazaar-assets' }">
          <IconTokens />
          {{ $t('views.WordBazaar.RibbonTabs.Assets.Text') }}
        </FilterButton>
        <FilterButton :to="{ name: 'word-bazaar-create-token' }">
          <IconPlus />
          {{ $t('views.WordBazaar.RibbonTabs.Create.Text') }}
        </FilterButton>
        <FilterButton :to="{ name: 'word-bazaar-get-ae' }">
          <IconAe />
          {{ $t('views.WordBazaar.RibbonTabs.Get.Text') }}
        </FilterButton>
        <FilterButton :to="{ name: 'word-bazaar-how-it-works' }">
          <IconHelp2 />
          {{ $t('views.WordBazaar.RibbonTabs.How.Text') }}
        </FilterButton>
      </template>
    </ActivityRibbon>

    <RouterView />
  </div>
</template>

<script>
import BackButtonRibbon from '../components/BackButtonRibbon.vue';
import Backend from '../utils/backend';
import ActivityRibbon from '../components/ActivityRibbon.vue';
import FilterButton from '../components/FilterButton.vue';
import IconHelp2 from '../assets/iconHelp2.svg?icon-component';
import IconTokens from '../assets/iconTokens.svg?icon-component';
import IconPlus from '../assets/iconPlus.svg?icon-component';
import IconAe from '../assets/iconAe.svg?icon-component';
import BubbleArrow from '../assets/bubbleArrow.svg?icon-component';

export default {
  components: {
    BackButtonRibbon,
    ActivityRibbon,
    FilterButton,
    IconTokens,
    IconPlus,
    IconAe,
    IconHelp2,
    BubbleArrow,
  },
  computed: {
    title() {
      return this.$route.matched[1].components.default.metaInfo.call(this).title;
    },
    headerIcon() {
      switch (this.$route.matched[1].name) {
        case 'word-bazaar-assets':
          return IconTokens;
        case 'word-bazaar-create-token':
          return IconPlus;
        case 'word-bazaar-get-ae':
          return IconAe;
        case 'word-bazaar-how-it-works':
          return IconHelp2;
        default: return null;
      }
    },
  },
  metaInfo: {
    titleTemplate: '%s - WordBazaar',
  },
};
</script>

<style lang="scss" scoped>
.word-bazaar {
  width: 624px;
  background: $actions_ribbon_background_color;

  ::v-deep .actions-ribbon {
    height: 56px;
    background-color: $actions_ribbon_background_color;
    color: $standard_font_color;

    .activity {
      white-space: nowrap;
      font-size: 17px;
      line-height: 22px;
      margin-right: 4px;
    }

    .activity-bubble {
      position: relative;
    }

    .bubbleArrow {
      height: 40px;
      color: $secondary_color;
    }

    .activity-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      height: 24px;
      width: 24px;
      color: $secondary_color;
    }
  }

  ::v-deep .activity-ribbon {
    box-sizing: border-box;
    background-color: $buttons_background;
    height: 65px;
    border-bottom: 1px solid $actions_ribbon_background_color;
    position: sticky;
    margin: 0;
    top: 56px;
    z-index: 2;

    .filter-button {
      height: 40px;
      border-radius: 20px;
      font-size: 16px;

      svg {
        height: 24px;
        margin-bottom: 2px;
        flex-shrink: 0;
      }

      .desktop { margin-left: 2px; }
      .mobile { display: none; }

      @include desktop {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 15px;
        font-weight: 500;
        height: 56px;
        margin: 0;

        &.router-link-active,
        &:hover {
          background-color: transparent;
        }

        .mobile { display: inline; }
        .desktop { display: none; }
      }
    }

    @include mobile {
      height: 72px;
      background:
        linear-gradient(
          180deg,
          $actions_ribbon_background_color 0%,
          $background_color 100%
        );
      border-radius: 0 0 10px 10px;
      top: 48px;
    }
  }

  ::v-deep .abbreviation {
    font-weight: 500;
    color: $secondary_color;
  }

  @include mobile {
    width: 360px;
  }
}
</style>
