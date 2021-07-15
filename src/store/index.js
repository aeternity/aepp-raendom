import Vue from 'vue';
import Vuex from 'vuex';
import BigNumber from 'bignumber.js';
import { genSwaggerClient } from '@aeternity/aepp-sdk';
import { mapObject } from '@aeternity/aepp-sdk/es/utils/other';
import { camelCase } from 'lodash-es';
import mutations from './mutations';
import getters from './getters';
import persistState from './plugins/persistState';
import modals from './plugins/modals';
import errorHandler from './plugins/errorHandler';
import backend from './modules/backend';
import aeternity from './modules/aeternity';
import Backend from '../utils/backend';
import { handleUnknownError } from '../utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    address: null,
    balance: 0,
    profile: {},
    pinnedItems: [],
    selectedCurrency: 'eur',
    chainNames: [],
    verifiedUrls: [],
    graylistedUrls: [],
    tokenInfo: {},
    tokenBalances: [],
    tokenPrices: {},
    wordRegistry: [],
    isHiddenContent: true,
    cookiesConsent: {},
    middleware: null,
  },
  mutations,
  actions: {
    async updateUserProfile({ commit, state: { address } }) {
      commit('setUserProfile', await Backend.getProfile(address));
    },
    async updatePinnedItems({ commit, state: { address } }) {
      commit('setPinnedItems', await Backend.getPinnedItems(address));
    },
    async updateCookiesConsent({ commit, dispatch }) {
      const list = await dispatch('backend/callWithAuth', { method: 'getCookiesConsent' });
      list.forEach(({ scope, status }) => commit('setCookiesConsent', {
        scope,
        status: status === 'ALLOWED',
      }));
    },
    async getTokenBalance({ state: { address, middleware } }, contractAddress) {
      const result = await middleware.getAex9Balance(contractAddress, address);
      return new BigNumber(result.amount || 0).toFixed();
    },
    async updateTokensBalanceAndPrice({ state: { address, middleware }, commit, dispatch }) {
      const tokens = await Backend.getTokenBalances(address);
      let knownTokens;
      try {
        knownTokens = (await Backend.getWordRegistry()).map((item) => item.tokenAddress);
      } catch (error) {
        handleUnknownError(error);
        return;
      }
      if (!middleware) await dispatch('initMiddleware');
      await Promise.all(Object.entries(tokens).map(async ([token]) => {
        commit('addTokenBalance', {
          token,
          balance: await dispatch('getTokenBalance', token),
        });
        if (knownTokens.includes(token)) {
          commit('addTokenPrice', {
            token,
            price: await Backend.getWordSaleDetailsByToken(token)
              .then((s) => s.buyPrice).catch(() => null),
          });
        }
      }));
    },
    async initMiddleware({ commit }) {
      const specUrl = `${process.env.VUE_APP_MIDDLEWARE_URL}/swagger/swagger.json`;
      const res = await fetch(specUrl);
      const spec = await res.json();

      spec.paths = {
        ...spec.paths,
        'aex9/balance/{token}/{account}?top=true': {
          get: {
            operationId: 'getAex9Balance',
            parameters: [
              {
                in: 'path',
                name: 'token',
                required: true,
                type: 'string',
              },
              {
                in: 'path',
                name: 'account',
                required: true,
                type: 'string',
              },
            ],
          },
        },
      };
      spec.basePath = '/mdw//';
      spec.schemes = ['https']; // TODO: Remove after solving https://github.com/aeternity/ae_mdw/issues/160

      const middleware = mapObject(
        (await genSwaggerClient(specUrl, { spec })).api,
        ([k, v]) => [camelCase(k), v],
      );
      commit('setMiddleware', middleware);
    },
    async fetchUserInfo({ dispatch, commit, state: { address, aeternity: { sdk } } }) {
      if (!address) return;
      await Promise.all([
        dispatch('updatePinnedItems'),
        dispatch('updateUserProfile'),
        (async () => {
          const balance = await sdk.balance(address).catch(() => 0);
          commit('updateBalance', balance);
        })(),
        dispatch('updateTokensBalanceAndPrice'),
      ]);
    },
  },
  getters,
  modules: {
    backend,
    aeternity,
  },
  plugins: [
    persistState(
      (state) => state,
      ({
        selectedCurrency, address, balance, tokenInfo, tokenBalances,
        tokenPrices, wordRegistry, cookiesConsent,
      }) => ({
        selectedCurrency,
        address,
        balance,
        tokenInfo,
        tokenBalances,
        tokenPrices,
        wordRegistry,
        cookiesConsent,
      }),
    ),
    modals,
    errorHandler,
  ],
});
