<template>
  <Page class="league-page-container">
    <div
      class="league-page"
    >
      <div id="jitsi" />
    </div>
  </Page>
</template>
<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import JitsiMeetExternalAPI from 'jitsi';
import { mapState, mapGetters } from 'vuex';
import Page from '../components/layout/Page.vue';
// import { wallet } from '../utils/walletSearch';
import { EventBus } from '../utils/eventBus';
// import { createDeepLinkUrl } from '../utils/util';
import { IS_MOBILE_DEVICE } from '../utils/util';

import { client } from '../utils/aeternity';

export default {
  name: 'Conference',
  components: {
    Page,
  },
  computed: {
    ...mapState(['useSdkWallet', 'account']),
    ...mapGetters(['isLoggedIn']),
  },
  created() {
    // sdkLive
    const message = `I would like to generate JWT token at ${new Date().toUTCString()}`;
    let signature;
    let address;

    EventBus.$on('clientLive', () => {
      //todo: somthing like if not mobile and useSdkWallet
      EventBus.$on('sdkLive', async () => {
        if (this.useSdkWallet) {
          signature = await client.signMessage(message);
          address = client.rpcClient.getCurrentAccount();
        }

        const token = await (await fetch('https://jwt.z52da5wt.xyz/claim ', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address, message, signature }),
        })).text();
        // eslint-disable-next-line no-undef, no-new
        new JitsiMeetExternalAPI('test.league.aeternity.org', {
          parentNode: document.querySelector('#jitsi'),
          width: '100%',
          height: 440,
          roomName: this.$route.params.room,
          jwt: token,
          configOverwrite: {
            disableDeepLinking: IS_MOBILE_DEVICE,
          },
        });
      });
      // const link = createDeepLinkUrl({
      //   type: 'address',
      //   'x-success': `${window.location}?address={address}`,
      // });
      // console.log({ link });

      // } else {
      //   // this.createDeepLinkUrl(method, { challenge, signature });
      // }
    });
  },
};
</script>
<style lang="scss">
.league-page-container {
  padding-top: 1rem;
}

.league-page {
  bottom: 0;
  position: absolute;
  top: 0;
  width: 31rem;
}

.league-page iframe {
  border: 0;
  height: 100%;
  width: 100%;
}

@media (max-width: 1024px) {
  .league-page {
    max-width: 100vw;
    top: 3.4rem;
    width: 25rem;
  }
}
</style>