<template>
  <div
    class="create-token"
    :class="{ wait: loadingState }"
  >
    <div class="create-header">
      <div class="create-header-content">
        <h2>
          {{ success ?
            $t('components.CreateToken.NewToken') :
            $t('components.CreateToken.CreateToken') }}
        </h2>
        <h3>
          {{ success ?
            `Redirecting in ${seconds} seconds` :
            $t('components.CreateToken.FiveMinutes') }}
        </h3>
        <i18n
          :path="`components.CreateToken.StepsDescription[${step}]`"
          tag="p"
          class="step-description"
        >
          <template #abbreviation>
            <span class="abbreviation">{{ name }}</span>
          </template>
          <template #step>
            {{ $t(`components.CreateToken.Steps[${step}]`) }}
          </template>
        </i18n>
      </div>
      <div class="arrow-up" />
    </div>
    <div class="steps-wrapper">
      <div class="steps">
        <div
          v-for="(n,i) in 4"
          :key="i"
          class="step"
        >
          <div
            class="step-box"
            :class="{ active: step >= i, pulse: ((step === i) || step >= 4) }"
          />
        </div>
      </div>
      <div class="create-inputs">
        <div class="input-block">
          <label for="name">{{ $t('components.CreateToken.Name.Title') }}</label>
          <Input
            v-if="!loadingState"
            id="name"
            v-model="name"
            :placeholder="$t('components.CreateToken.Name.Placeholder')"
            :class="{ error: error.name }"
            minlength="1"
            :disabled="loadingState"
          />
          <p
            v-else
            class="abbreviation"
          >
            {{ name }}
          </p>
          <div
            v-if="!loadingState"
            class="input-info"
          >
            <span class="error">{{ error.name || '' }}</span>
            <div>
              <span :class="{ error: error.name }">{{ name.length }}</span>
              <span> / {{ maxNameLength }}</span>
            </div>
          </div>
        </div>
        <div class="input-block">
          <label for="description">{{ $t('components.CreateToken.Description.Title') }}</label>
          <textarea
            v-if="!loadingState"
            id="description"
            v-model="description"
            :placeholder="$t('components.CreateToken.Description.Placeholder')"
            :class="{ multiline: description.split('\n').length > 1,
                      error: error.description }"
            :rows="description.split('\n').length || 1"
            minlength="1"
            :disabled="loadingState"
          />
          <p
            v-else
            class="description"
          >
            {{ description }}
          </p>
          <div
            v-if="!loadingState"
            class="input-info"
          >
            <span class="error">{{ error.description || '' }}</span>
            <div>
              <span :class="{ error: error.description }">{{ description.length }}</span>
              <span>{{ ` / ${maxDescriptionLength}` }}</span>
            </div>
          </div>
        </div>
        <div class="input-block button">
          <AeButton
            v-if="success"
            :to="{ name: 'word-bazaar-assets' }"
          >
            <RightArrow />
            <span>
              {{ $t('components.CreateToken.Proceed') }}
            </span>
          </AeButton>
          <AeButton
            v-else
            :disabled="loadingState ||
              !name.length || !description.length || !!error.name || !!error.description"
            @click="createWordSale"
          >
            <RightArrow />
            <span>
              {{ loadingState ?
                $t('components.CreateToken.Proceed') :
                $t('components.CreateToken.CreateToken') }}
            </span>
          </AeButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Backend from '../utils/backend';
import { EventBus } from '../utils/eventBus';
import Input from '../components/Input.vue';
import AeButton from '../components/AeButton.vue';
import RightArrow from '../assets/rightArrow.svg?icon-component';

export default {
  name: 'CreateToken',
  components: {
    Input,
    AeButton,
    RightArrow,
  },
  props: {
    word: { type: String, default: null },
    sale: { type: String, default: null },
    heading: { type: Boolean },
  },
  data: () => ({
    name: '',
    description: '',
    loadingState: false,
    step: 0,
    success: false,
    seconds: 10,
    maxNameLength: 14,
    maxDescriptionLength: 500,
  }),
  computed: {
    invalidInputs() {
      return this.loadingState
      || !this.name.length || !this.description.length
      || Object.values(this.error).includes((e) => e !== null);
    },
    error() {
      return {
        name: this.name.length > this.maxNameLength
          ? this.$t('components.CreateToken.Name.Error', { maxLength: this.maxNameLength }) : null,
        description: this.description.length > this.maxDescriptionLength
          ? this.$t('components.CreateToken.Description.Error', { maxLength: this.maxDescriptionLength }) : null,
      };
    },
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  methods: {
    navigateAssets() {
      this.$router.push({ name: 'word-bazaar-assets' });
    },
    async createWordSale() {
      try {
        this.loadingState = true;
        const decimals = 18;
        const bondingCurveAddress = process.env.VUE_APP_BONDING_CURVE_18_DECIMALS_ADDRESS;
        const timeout = 20;

        this.step = 1;

        const tokenSaleAddress = await this.$store.dispatch('aeternity/deployTokenSaleContract',
          {
            decimals,
            timeout,
            bondingCurveAddress,
            description: this.description,
          });

        this.step = 2;
        const fungibleTokenAddress = await this.$store.dispatch('aeternity/deployFungibleTokenContract',
          {
            name: this.name,
            decimals,
            symbol: this.name,
            tokenSaleAddress,
          });

        this.step = 3;

        await Backend.addToken(fungibleTokenAddress);
        EventBus.$emit('reloadData');
        await Backend.invalidateWordRegistryCache();

        this.step = 4;
        EventBus.$emit('reloadData');

        this.success = true;
        this.countdown();
      } catch (error) {
        this.$store.dispatch('modals/open', {
          name: 'failure',
          title: error.message,
          body: [
            this.$t('components.CreateToken.Error[0]', {
              index: this.step + 1,
              step: this.$t(`components.CreateToken.Steps[${this.step}]`),
            }),
            this.$t('components.CreateToken.Error[1]', { abbreviation: this.name }),
          ],
          hideIcon: true,
          primaryButtonText: 'OK',
        });
        this.name = '';
        this.description = '';
        this.loadingState = false;
        this.step = 0;
        this.success = false;
      }
    },
    countdown() {
      this.interval = setInterval(() => {
        this.seconds -= 1;
        if (this.seconds <= 0) {
          clearInterval(this.interval);
          this.navigateAssets();
        }
      }, 1000);
    },
  },
  metaInfo() {
    return { title: this.$t('views.WordBazaar.RibbonTabs.Create.Text') };
  },
};
</script>

<style lang="scss" scoped>
.create-token {
  background-color: $actions_ribbon_background_color;
  color: $light_font_color;
  height: 100%;
}

.create-header {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('../assets/createTokenBg.svg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    mix-blend-mode: luminosity;
  }

  .create-header-content {
    padding-top: 1.2rem;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    h2,
    h3 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }

    h2 {
      font-size: 1.6rem;
      font-weight: bold;
      color: $pure_white;
    }

    h3 {
      font-size: 1rem;
      font-weight: normal;
      color: $tip_note_color;
    }

    .step-description {
      font-size: 0.75rem;
      font-weight: 500;
      color: $pure_white;
      margin: 1rem;
      text-align: center;
    }
  }

  .arrow-up {
    position: absolute;
    bottom: 0;
    margin-left: -0.5rem;
    left: 50%;
    width: 0;
    height: 0;
    border-left: 0.5rem solid transparent;
    border-right: 0.5rem solid transparent;
    border-bottom: 0.5rem solid $card_border_color;
  }
}

.steps-wrapper {
  border: 1.5px solid $card_border_color;
  border-radius: 10px;
  margin: 0 16px;
  padding: 16px;

  .steps {
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    .step {
      flex-grow: 1;
      margin: 0 0.4rem;
      position: relative;

      .step-box {
        height: 0.8rem;
        background: $super_dark;
        border: 1px solid $super_dark;
        box-sizing: border-box;
        box-shadow: inset -0.1rem 0.15rem 0.3rem rgba($background_color, 0.25);
        border-radius: 0.3rem;

        &.active {
          background: $custom_links_color;
          box-shadow:
            inset 0 0 0.3rem 0.05rem
            rgba(
              red($custom_links_color),
              green($custom_links_color),
              blue($custom_links_color),
              0.4
            );

          &.pulse {
            animation: pulse 2s infinite ease-in-out;
          }

          @keyframes pulse {
            0%,
            100% {
              filter: opacity(0.4);
            }

            50% {
              filter: opacity(1);
            }
          }
        }
      }
    }
  }

  .create-inputs {
    display: flex;
    flex-direction: column;
    height: 100%;

    .input-block {
      margin-top: 32px;
    }

    label {
      font-weight: 500;
      font-size: 15px;
      line-height: 19px;
      display: inline-block;
      margin-bottom: 0.5rem;
    }

    input,
    textarea {
      display: block;
      width: 100%;
      height: 40px;
      resize: none;
      padding: 8px 16px;

      @include input-like;

      &.multiline {
        height: 100%;
      }

      &.error {
        border-color: $red_color;
      }
    }

    p {
      word-break: break-word;
      font-size: 15px;
      line-height: 24px;
      margin-top: 8px;
      margin-bottom: 0;

      &.description {
        color: $tip_note_color;
      }
    }

    .button {
      display: flex;
      justify-content: flex-end;

      .ae-button {
        font-weight: 700;
        height: 40px;

        @include mobile {
          width: 100%;
        }

        svg {
          height: 1.2rem;
          border-radius: 100%;
          background-color: rgba($standard_font_color, 0.44);
          padding: 0.2rem;
          margin-bottom: 0.1rem;
          margin-right: 3px;
          vertical-align: middle;
        }
      }
    }
  }
}

.input-info {
  font-size: 12px;
  line-height: 16px;
  display: flex;
  justify-content: space-between;
  margin-top: 8px;

  span {
    transition: color 0.3s;

    &.error {
      color: $red_color;
    }
  }
}

.wait {
  cursor: wait;

  button,
  label {
    cursor: wait;
  }
}
</style>
