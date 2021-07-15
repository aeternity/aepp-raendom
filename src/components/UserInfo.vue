<template>
  <div class="user-info">
    <div
      class="profile-section"
      :style="{ '--cover-image': 'url(' + BACKEND_URL + profile.coverImage + ')' }"
    >
      <div
        class="profile-header"
        :class="{ 'profile-editable': backendAuth && currentAddress === address }"
      >
        <div class="profile-image">
          <Avatar :address="address" />
          <TipInput
            v-if="currentAddress !== address"
            :user-address="address"
            class="profile-button avatar-button"
          />
          <template v-else-if="!editMode && backendAuth">
            <label
              class="profile-button avatar-button"
              :title="$t('views.UserProfileView.ChangeAvatar')"
            >
              <img src="../assets/buttonPhoto.svg">
              <input
                type="file"
                name="avatar"
                accept="image/png, image/jpeg"
                @change="uploadPhoto($event)"
              >
            </label>
            <button
              class="profile-button delete-avatar-button"
              :title="$t('views.UserProfileView.DeleteAvatar')"
              @click="deleteAvatar"
            >
              <IconCancel />
            </button>
          </template>
        </div>
        <div class="profile-info">
          <a
            class="profile-username"
            target="_blank"
            :href="explorerTransactionsUrl"
          >
            <div class="chain">
              {{ userChainName ? userChainName : $t('FellowSuperhero') }}
            </div>
            <div class="text-ellipsis">{{ address }}</div>
          </a>
          <div
            v-if="balance"
            class="balance text-ellipsis"
          >
            {{ $t('Balance') }} <AeAmountFiat :amount="balance" />
          </div>
          <div class="profile-row">
            <div class="location">
              <img
                v-if="profile.location.length || currentAddress === address"
                src="../assets/location.svg"
              >
              <input
                v-if="editMode"
                v-model="profile.location"
                class="location-input"
                type="text"
                :placeholder="$t('views.UserProfileView.LocationPlaceholder')"
              >
              <span v-if="!editMode && (profile.location.length || currentAddress === address)">
                {{
                  profile.location.length
                    ? profile.location
                    : $t('views.UserProfileView.Location')
                }}
              </span>
            </div>
            <div
              v-if="userStats && hasCreationDate"
              class="joined"
            >
              <span>{{ $t('views.UserProfileView.Joined') }}</span>
              <time :datetime="joinedAtISO">{{ joinedAt }}</time>
            </div>
          </div>
        </div>
        <div
          v-if="backendAuth && currentAddress === address"
          class="edit-buttons"
        >
          <label
            v-if="!editMode"
            :title="$t('views.UserProfileView.ChangeCoverPhoto')"
            class="profile-button edit-button"
          >
            <img src="../assets/buttonPhoto.svg">
            <input
              type="file"
              name="cover"
              accept="image/png, image/jpeg"
              @change="uploadPhoto($event, true)"
            >
          </label>
          <button
            v-if="!editMode"
            class="profile-button edit-button"
            type="button"
            :title="$t('views.UserProfileView.EditProfile')"
            @click="editMode = true"
          >
            <img src="../assets/buttonEdit.svg">
          </button>
          <button
            v-if="editMode"
            type="button"
            class="profile-button cancel-button"
            :title="$t('cancel')"
            @click="resetEditedValues"
          >
            <IconCancel />
          </button>
          <button
            v-if="editMode"
            type="button"
            class="profile-button save-button"
            :title="$t('views.UserProfileView.Save')"
            @click="saveProfile"
          >
            <img src="../assets/buttonSave.svg">
          </button>
        </div>
      </div>
      <div
        v-if="!editMode"
        class="profile-description"
      >
        {{ profile.biography }}
      </div>
      <div
        v-if="editMode"
        class="profile-description"
      >
        <textarea
          v-model="profile.biography"
          :maxlength="maxLength"
          :rows="profile.biography.split('\n').length || 1"
          :placeholder="$t('views.UserProfileView.EditBiography')"
        />
        <div
          class="text-length"
          :class="{ 'error': profile.biography.length > maxLength }"
        >
          {{ countLength }}
        </div>
      </div>
    </div>
    <div
      v-if="editMode"
      class="cookies-settings"
    >
      <div class="cookies-header">
        <IconCookies />
        Cookies policy
      </div>
      <div class="cookies-list">
        Allow third-party tracking cookies
        <div>
          <ButtonPlain
            v-for="scope in ['SoundCloud', 'YouTube']"
            :key="scope"
            class="cookies-button"
            :class="{ active: cookiesConsent[scope] }"
            @click="toggleCookiesConsent(scope)"
          >
            {{ scope }}
          </ButtonPlain>
        </div>
      </div>
    </div>
    <div class="profile-stats">
      <div
        v-for="(divClass, index) in ['tip_stats', 'stats']"
        :key="index"
        :class="divClass"
      >
        <div
          v-for="(stat, idx) in divClass === 'tip_stats' ? tipStats : showedStats"
          :key="idx"
          :class="divClass === 'tip_stats' ? 'tips-stats-block' : 'stat-block'"
        >
          <span class="stat-value">
            {{ stat.value }}
          </span>
          <span class="stat-title">
            <img
              v-if="stat.image"
              :src="stat.image"
            >
            {{ stat.title }}
          </span>
          <AeAmountFiat
            v-if="stat.amount"
            :amount="stat.amount"
            class="stat-value"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Backend from '../utils/backend';
import AeAmountFiat from './AeAmountFiat.vue';
import Avatar from './Avatar.vue';
import { EventBus } from '../utils/eventBus';
import TipInput from './TipInput.vue';
import ButtonPlain from './ButtonPlain.vue';
import SuccessIcon from '../assets/verifiedUrl.svg';
import IconCookies from '../assets/iconCookies.svg?icon-component';
import IconCancel from '../assets/iconCancel.svg?icon-component';

export default {
  components: {
    AeAmountFiat,
    Avatar,
    TipInput,
    IconCookies,
    IconCancel,
    ButtonPlain,
  },
  props: {
    address: { type: String, required: true },
    backendAuth: { type: Function, default: null },
  },
  data() {
    return {
      maxLength: 250,
      userStats: {
        tipsLength: '-',
        retipsLength: '-',
        totalTipAmount: '0',
        claimedUrlsLength: '-',
        unclaimedAmount: '0',
        claimedAmount: '0',
        userComments: '-',
      },
      editMode: false,
      userCommentCount: 0,
      profile: {
        biography: '',
        createdAt: '',
        location: '',
        coverImage: '',
      },
      balance: '',
      BACKEND_URL: process.env.VUE_APP_BACKEND_URL,
    };
  },
  computed: {
    ...mapState(['cookiesConsent', 'chainNames']),
    ...mapState('aeternity', ['sdk']),
    ...mapState({ currentAddress: 'address' }),
    userChainName() {
      return this.profile.preferredChainName;
    },
    hasCreationDate() {
      return this.profile.createdAt.length > 0;
    },
    joinedAtISO() {
      try {
        return new Date(this.profile.createdAt).toISOString();
      } catch {
        return '';
      }
    },
    joinedAt() {
      try {
        return new Date(this.profile.createdAt)
          .toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
      } catch {
        return '';
      }
    },
    countLength() {
      return `${this.profile.biography.length}/${this.maxLength}`;
    },
    tipStats() {
      return [
        {
          value: this.userStats.totalTipsLength,
          title: this.$t('views.UserProfileView.TipsSent'),
          amount: this.userStats.totalAmount,
        },
        {
          value: this.userStats.urlStats?.totaltipslength,
          title: this.$t('views.UserProfileView.TipsReceived'),
          amount: this.userStats.urlStats?.totalAmount,
        },
      ];
    },
    showedStats() {
      return [
        { value: this.userStats.commentCount, title: this.$t('views.UserProfileView.Comments') },
        {
          value: this.userStats.claimedUrlsLength,
          image: SuccessIcon,
          title: this.$t('views.UserProfileView.ClaimedUrls'),
        },
      ];
    },
    explorerTransactionsUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/account/transactions/${this.address}`;
    },
  },
  mounted() {
    this.$watch(
      () => this.address,
      () => {
        this.reloadData();
        this.reloadBalance();
      },
      { immediate: true },
    );

    EventBus.$on('reloadData', () => {
      this.reloadData();
    });

    const interval = setInterval(() => this.reloadData(), 120 * 1000);
    this.$once('hook:beforeDestroy', () => clearInterval(interval));
  },
  methods: {
    ...mapActions('backend', ['setCookies']),
    async reloadBalance() {
      await this.$watchUntilTruly(() => this.sdk);
      this.balance = await this.sdk.balance(this.address).catch(() => 0);
    },
    async resetEditedValues() {
      this.editMode = false;
      await this.getProfile();
    },
    async saveProfile() {
      await this.backendAuth('sendProfileData', {
        biography: this.profile.biography,
        location: this.profile.location,
      });
      await this.resetEditedValues();
    },
    async deleteAvatar() {
      await this.backendAuth('sendProfileData', { image: null });
      await this.resetEditedValues();
    },
    async uploadPhoto(event, isCoverPhoto) {
      const data = new FormData();
      data.append(isCoverPhoto ? 'coverImage' : 'image', event.target.files[0]);
      await this.backendAuth('sendProfileData', data);
      await this.resetEditedValues();
    },
    reloadData() {
      this.getProfile();
      Backend.getSenderStats(this.address).then((stats) => {
        this.userStats = stats;
      });
    },
    async getProfile() {
      Backend.getProfile(this.address)
        .then((profile) => {
          if (!profile) {
            return;
          }
          this.profile = profile;
          this.profile.location = this.profile.location || '';
          this.profile.biography = this.profile.biography || '';
          this.profile.coverImage = this.profile.coverImage || '';
          this.$store.commit('setUserProfile', profile);
        })
        .catch(console.error);
    },
    async toggleCookiesConsent(scope) {
      try {
        await this.$store.dispatch(
          'backend/setCookies',
          { scope, status: !this.cookiesConsent[scope] },
        );
      } catch (error) {
        if (error.message !== 'Operation rejected by user') throw error;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
input[type="file"] {
  display: none;
}

.profile-description {
  color: $tip_note_color;
  display: flex;
  flex-flow: wrap;
  margin: 0 1rem;
  position: relative;

  .text-length {
    color: $light_font_color;
    flex-grow: 1;
    margin-top: 0.2rem;
    text-align: right;
  }
}

.user-info {
  color: $tip_note_color;
  font-size: 0.75rem;

  .error {
    color: $red_color;
  }

  .edit-buttons {
    .profile-button {
      display: block;
      margin-bottom: 0.6rem;
    }

    @include mobile {
      position: absolute;
      right: 0.5rem;
      top: 0.4rem;
      display: flex;
      flex-direction: row;
    }
  }

  .profile-button {
    border: 0;
    border-radius: 100%;
    cursor: pointer;
    flex-basis: 1.5rem;
    flex-grow: 0;
    height: 1.5rem;
    margin: 0;
    padding: 0;
    width: 1.5rem;

    img {
      width: 100%;
    }

    &:focus {
      outline: 0;
    }
  }

  .delete-avatar-button {
    background: #ff49521e;
    display: none;
    position: absolute;
    left: -0.25rem;
    top: 0;
    color: #fff;

    &:hover {
      background: #ff495242;
    }
  }

  & .profile-image:hover .delete-avatar-button {
    display: unset;
  }

  .edit-button,
  .cancel-button {
    background: #babac01e;
    color: #fff;

    &:hover {
      background: #babac042;
    }
  }

  .save-button {
    background: #00ff9da8;

    &:hover {
      background: #00ff9dcc;
    }
  }

  .no-results {
    color: $standard_font_color;
    font-size: 0.75rem;
    text-align: center;
  }

  .location,
  .joined {
    font-size: 0.7rem;
  }

  .location,
  .joined time {
    color: $standard_font_color;
  }

  .location span,
  .joined time {
    margin-left: 0.2rem;
  }

  .location {
    margin-right: 0.5rem;

    &:empty {
      margin-right: 0;
    }

    img {
      vertical-align: top;
      height: 0.75rem;
      width: auto;
    }

    input[type="text"] {
      display: inline;
      padding-left: 0.25rem;
    }
  }

  .balance {
    margin-top: 0.3rem;
    font-size: 0.7rem;
  }

  textarea,
  .location-input {
    background: no-repeat url('../assets/textEdit.svg') bottom 0.1rem right;
    border: 0;
    border-bottom: 1px solid $standard_font_color;
    color: $tip_note_color;
    display: flex;
    flex: 1 1 100%;
    resize: none;
    padding-right: 1rem;

    &::-webkit-scrollbar {
      display: none;
    }

    &:focus {
      background: no-repeat url('../assets/textEditFocus.svg') bottom 0.1rem right;
      border-bottom: 1px solid $secondary_color;
      outline: 0;
    }
  }
}

.profile-header {
  align-items: flex-start;
  display: flex;
  padding: 1rem  1rem 0.5rem 1rem;
  position: relative;
}

.profile-row {
  margin-top: 0.3rem;
  display: flex;
}

.tip-stats {
  display: grid;
  grid-auto-flow: column;

  .ae-amount-fiat {
    display: block;
  }
}

.tips-stats-block {
  background-color: $thumbnail_background_color;
  border-right: 1px solid $light_color;
  padding: 0.5rem 1rem;
}

.tips-stats-block:last-child {
  border: 0;
}

.stats {
  background-color: $thumbnail_background_color;
  border-top: 1px solid $light_color;
  display: flex;
  padding: 0.5rem 1rem;
  width: 100%;
}

.stat-block {
  margin-right: 2rem;

  img {
    height: 0.75rem;
    width: auto;
    margin-bottom: 0.2rem;
  }
}

.stat-value {
  color: $tip_note_color;
  font-size: 0.75rem;
  vertical-align: middle;
}

.stat-title {
  color: $lighter_font_color;
  font-size: 0.7rem;
  vertical-align: middle;

  img {
    vertical-align: middle;
  }
}

.profile-section {
  background:
    linear-gradient(rgba($light_color, 0.8), rgba($light_color, 0.8)),
    var(--cover-image),
    $light_color;
  background-size: cover;
  background-position: center;
  position: relative;
  padding-bottom: 1rem;
}

.profile-image {
  display: flex;
  margin-right: 0.5rem;
  position: relative;
  vertical-align: super;

  .avatar {
    height: 5.5rem;
    width: 5.5rem;
  }
}

.profile-info {
  min-width: 0;

  .profile-username {
    color: $tip_note_color;
    display: block;
    font-size: 0.6rem;
    word-break: break-all;

    @include mobile {
      font-size: 0.55rem;
    }

    .chain {
      color: $standard_font_color;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

@include mobile {
  .profile-header {
    white-space: nowrap;

    .profile-image .avatar {
      height: 5rem;
      width: 5rem;
    }
  }

  .user-info .avatar-button {
    bottom: -0.5rem;
  }

  .user-info .delete-avatar-button {
    top: -0.5rem;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: 8rem auto;
  }

  .tip-stats {
    grid-auto-flow: row;
    order: 2;
  }

  .tips-stats-block {
    border: 0;
    border-bottom: 1px solid $light_color;
  }

  .stats {
    border: 0;
    border-right: 1px solid $light_color;
    flex-direction: column;
    justify-content: space-around;
  }

  .stat-block {
    margin: 0;
  }
}

@include smallest {
  .profile-header .profile-image.avatar {
    height: 4.5rem;
    width: 4.5rem;
  }

  .profile-row {
    display: block;

    input {
      margin-bottom: 0.3rem;
    }
  }
}

.cookies-settings {
  font-weight: 500;

  .cookies-header {
    background-color: $light_color;
    color: $standard_font_color;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.5rem 1rem;

    svg {
      height: 0.9rem;
      margin-bottom: 0.2rem;
      margin-right: 0.2rem;
      vertical-align: middle;
    }
  }

  .cookies-list {
    color: $light_font_color;
    background-color: $buttons_background;
    padding: 0.5rem 1rem;

    .cookies-button {
      border-radius: 1rem;
      font-weight: 500;
      padding: 0.35rem 0.7rem;
      background-color: $thumbnail_background_color;
      margin: 0.5rem 0.5rem 0.5rem 0;

      &.active {
        color: $secondary_color;
        background-color: #1161fe50;
      }
    }
  }
}
</style>
