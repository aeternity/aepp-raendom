<template>
  <span class="ae-amount">
    <span>{{ roundedAmount }}</span>
    <!--eslint-disable-next-line vue-i18n/no-raw-text-->
    <span
      v-if="!noSymbol"
      class="ae"
    >{{ tokenSymbol || 'AE' }}</span>
  </span>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  props: {
    amount: { type: [String, Number], default: 0 },
    round: { type: Number, default: 2 },
    token: { type: String, default: null },
    noSymbol: { type: Boolean },
  },
  computed: {
    ...mapGetters(['roundedTokenAmount']),
    ...mapState({
      amountTokenInfo({ tokenInfo }) {
        return this.token ? tokenInfo[this.token] : null;
      },
    }),
    tokenSymbol() {
      return this.amountTokenInfo ? this.amountTokenInfo.symbol : null;
    },
    roundedAmount() {
      return this.roundedTokenAmount(this.amount || 0, this.token, this.round, true);
    },
  },
};
</script>

<style lang="scss" scoped>
.ae-amount {
  color: $standard_font_color;

  .ae {
    color: $secondary_color;
    padding-left: 2px;
  }
}
</style>
