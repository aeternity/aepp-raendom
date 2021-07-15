/* globals Cypress */
import {
  MemoryAccount, Node, Universal, RpcAepp, Crypto, WalletDetector, BrowserWindowMessageConnection,
} from '@aeternity/aepp-sdk';
import TIPPING_INTERFACE_V1 from 'tipping-contract/Tipping_v1_Interface.aes';
import TIPPING_INTERFACE_V2 from 'tipping-contract/Tipping_v2_Interface.aes';
import TIPPING_INTERFACE_V3 from 'tipping-contract/Tipping_v3_Interface.aes';
import tippingContractUtil from 'tipping-contract/util/tippingContractUtil';

import FUNGIBLE_TOKEN_CONTRACT_INTERFACE from 'aeternity-fungible-token/FungibleTokenFullInterface.aes';
import FUNGIBLE_TOKEN_CONTRACT from 'wordbazaar-contracts/FungibleTokenCustom.aes';
import TOKEN_VOTING_CONTRACT from 'wordbazaar-contracts/TokenVoting.aes';
import TOKEN_SALE_CONTRACT from 'wordbazaar-contracts/TokenSale.aes';
import WORD_REGISTRY_CONTRACT from 'wordbazaar-contracts/WordRegistry.aes';
import BONDING_CURVE from 'sophia-bonding-curve/BondCurveLinear.aes';

import { BigNumber } from 'bignumber.js';
import { IS_MOBILE_DEVICE, shiftDecimalPlaces } from '../../utils';

export default {
  namespaced: true,
  state: {
    sdk: null,
    useSdkWallet: false,
    useIframeWallet: false,
    contractV1: null,
    contractV2: null,
    contractV3: null,
    wordRegistryContract: null,
    fungibleTokenContracts: {},
    tokenVotingContracts: {},
    tokenSaleContracts: {},
    isTippingContractsInitialised: false,
  },
  mutations: {
    setContracts(state, contracts) {
      const [contractV1, contractV2, contractV3] = contracts;
      state.contractV1 = contractV1;
      state.contractV2 = contractV2;
      state.contractV3 = contractV3;
      state.isTippingContractsInitialised = true;
    },
    setSdk(state, { instance }) {
      state.sdk = instance;
    },
    useSdkWallet(state) {
      state.useSdkWallet = true;
    },
    enableIframeWallet(state) {
      state.useIframeWallet = true;
    },
    setFungibleTokenContract(state, contractAddress, instance) {
      state.fungibleTokenContracts[contractAddress] = instance;
    },
    setTokenVotingContract(state, contractAddress, instance) {
      state.tokenVotingContracts[contractAddress] = instance;
    },
    setTokenSaleContract(state, contractAddress, instance) {
      state.tokenSaleContracts[contractAddress] = instance;
    },
    setWordRegistryContract(state, instance) {
      state.wordRegistryContract = instance;
    },
  },
  actions: {
    async initTippingContractIfNeeded({
      commit,
      state: {
        sdk,
        isTippingContractsInitialised,
      },
    }) {
      if (!sdk) throw new Error('Init sdk first');
      if (isTippingContractsInitialised) return;
      const contracts = await Promise.all([
        [TIPPING_INTERFACE_V1, process.env.VUE_APP_CONTRACT_V1_ADDRESS],
        [TIPPING_INTERFACE_V2, process.env.VUE_APP_CONTRACT_V2_ADDRESS],
        [TIPPING_INTERFACE_V3, process.env.VUE_APP_CONTRACT_V3_ADDRESS],
      ].map(([tippingInterface, contractAddress]) => (contractAddress
        ? sdk.getContractInstance(tippingInterface, { contractAddress })
        : null)));
      commit('setContracts', contracts);
    },
    async initSdk({ dispatch, commit }) {
      const options = {
        nodes: [{ name: 'node', instance: await Node({ url: process.env.VUE_APP_NODE_URL }) }],
        compilerUrl: process.env.VUE_APP_COMPILER_URL,
      };
      if (window.Cypress) {
        const instance = await Universal({
          ...options,
          accounts: [
            MemoryAccount({
              keypair: { secretKey: Cypress.env('privateKey'), publicKey: Cypress.env('publicKey') },
            }),
          ],
          address: Cypress.env('publicKey'),
        });
        const rpcClient = async () => Cypress.env('publicKey');
        instance.rpcClient = { getCurrentAccount: async () => Cypress.env('publicKey') };
        commit('setSdk', { instance, rpcClient });
        await dispatch('initTippingContractIfNeeded');
      } else {
        const instance = await RpcAepp({
          ...options,
          name: 'Superhero',
          onDisconnect() {
            commit('resetState');
          },
          async onAddressChange(accounts) {
            const address = Object.keys(accounts.current)[0];
            commit('setAddress', address, { root: true });
            await dispatch('fetchUserInfo', null, { root: true });
          },
        });
        commit('setSdk', { instance });
        await dispatch('initTippingContractIfNeeded');
      }
    },
    async scanForWallets({ commit, state: { sdk } }) {
      const scannerConnection = await BrowserWindowMessageConnection({
        connectionInfo: { id: 'spy' },
      });
      const detector = await WalletDetector({ connection: scannerConnection });
      const webWalletTimeout = setTimeout(() => !IS_MOBILE_DEVICE && commit('enableIframeWallet'), 10000);

      return new Promise((resolve) => {
        detector.scan(async ({ newWallet }) => {
          if (!newWallet) return;
          clearInterval(webWalletTimeout);
          await sdk.connectToWallet(await newWallet.getConnection());
          await sdk.subscribeAddress('subscribe', 'current');
          const address = sdk.rpcClient.getCurrentAccount();
          if (!address) return;
          detector.stopScan();
          commit('setAddress', address, { root: true });
          resolve(address);
        });
      });
    },
    async getHeight({ state: { sdk } }) {
      return sdk.height();
    },
    async initFungibleTokenContractIfNeeded(
      { commit, state: { sdk, fungibleTokenContracts } },
      contractAddress,
    ) {
      if (!fungibleTokenContracts[contractAddress]) {
        const contract = await sdk
          .getContractInstance(FUNGIBLE_TOKEN_CONTRACT_INTERFACE, { contractAddress });
        commit('setFungibleTokenContract', contractAddress, contract);
        return contract;
      }

      return fungibleTokenContracts[contractAddress];
    },
    async initWordRegistryContractIfNeeded({ commit, state: { sdk, wordRegistryContract } }) {
      if (!wordRegistryContract) {
        const contract = await sdk
          .getContractInstance(WORD_REGISTRY_CONTRACT,
            { contractAddress: process.env.VUE_APP_WORD_REGISTRY_ADDRESS });
        commit('setWordRegistryContract', contract);
        return contract;
      }

      return wordRegistryContract;
    },
    async initTokenVotingContractIfNeeded(
      { commit, state: { sdk, tokenVotingContracts } },
      contractAddress,
    ) {
      if (!tokenVotingContracts[contractAddress]) {
        const contract = await sdk
          .getContractInstance(TOKEN_VOTING_CONTRACT, { contractAddress });
        commit('setTokenVotingContract', contractAddress, contract);
        return contract;
      }

      return tokenVotingContracts[contractAddress];
    },
    async initTokenSaleContractIfNeeded(
      { commit, state: { sdk, tokenSaleContracts } },
      contractAddress,
    ) {
      if (!tokenSaleContracts[contractAddress]) {
        const contract = await sdk.getContractInstance(TOKEN_SALE_CONTRACT, { contractAddress });
        commit('setTokenSaleContract', contractAddress, contract);
        return contract;
      }

      return tokenSaleContracts[contractAddress];
    },
    async deployBondingCurve({ state: { sdk } }, decimals) {
      // alters bonding curve contract to change the dependency default 1 alpha to 18
      // as we use 18 decimals and thus need to adjust the curve to match that
      const BONDING_CURVE_DECIMALS = BONDING_CURVE.replace(
        'function alpha() : Frac.frac = Frac.make_frac(1, 1)',
        `function alpha() : Frac.frac = Frac.make_frac(1, ${shiftDecimalPlaces(1, decimals)})`,
      );
      const contract = await sdk.getContractInstance(BONDING_CURVE_DECIMALS);
      await contract.methods.init();

      return contract.deployInfo.address;
    },
    async deployTokenSaleContract(
      { commit, state: { sdk } },
      {
        decimals,
        timeout,
        bondingCurveAddress,
        description,
      },
    ) {
      // alters token sale contract to change the dependency default 1 decimals to 18
      // as we want that as default for use with wordbazaar
      const TOKEN_SALE_CONTRACT_DECIMALS = TOKEN_SALE_CONTRACT.replace(
        'let decimals = 1',
        `let decimals = ${shiftDecimalPlaces(1, decimals)}`,
      );

      const contract = await sdk.getContractInstance(TOKEN_SALE_CONTRACT_DECIMALS);
      await contract.methods.init(timeout, bondingCurveAddress, description);
      commit('setTokenSaleContract', contract.deployInfo.address, contract);
      return contract.deployInfo.address;
    },
    async deployFungibleTokenContract(
      { commit, state: { sdk } },
      {
        name,
        decimals,
        symbol,
        tokenSaleAddress,
      },
    ) {
      const contract = await sdk.getContractInstance(FUNGIBLE_TOKEN_CONTRACT);
      await contract.methods
        .init(name, decimals, symbol, tokenSaleAddress, process.env.VUE_APP_WORD_REGISTRY_ADDRESS);
      commit('setFungibleTokenContract', contract.deployInfo.address, contract);
      return contract.deployInfo.address;
    },
    async deployTokenVotingContract(
      { commit, state: { sdk } },
      {
        metadata,
        closeHeight,
        token,
      },
    ) {
      const contract = await sdk.getContractInstance(TOKEN_VOTING_CONTRACT);
      await contract.methods.init(metadata, closeHeight, token);
      commit('setTokenVotingContract', contract.deployInfo.address, contract);
      return contract.deployInfo.address;
    },
    async wordRegistryAddToken({ dispatch }, addTokenAddress) {
      const contract = await dispatch('initWordRegistryContractIfNeeded');

      const { decodedResult } = await contract.methods.add_token(addTokenAddress);
      return decodedResult;
    },
    async tokenSaleMethod(
      { dispatch },
      {
        contractAddress,
        method,
        args = [],
        options = {},
      },
    ) {
      const contract = await dispatch('initTokenSaleContractIfNeeded', contractAddress);

      const { decodedResult } = await contract.methods[method](...args, options);
      return decodedResult;
    },
    async tokenVotingMethod(
      { dispatch },
      {
        contractAddress,
        method,
        args = [],
        options = {},
      },
    ) {
      const contract = await dispatch('initTokenVotingContractIfNeeded', contractAddress);

      const { decodedResult } = await contract.methods[method](...args, options);
      return decodedResult;
    },
    async tokenBalance({ dispatch }, { contractAddress, address }) {
      const contract = await dispatch('initFungibleTokenContractIfNeeded', contractAddress);

      const { decodedResult } = await contract.methods.balance(address);
      return new BigNumber(decodedResult || 0).toFixed();
    },
    async tokenTotalSupply({ dispatch }, contractAddress) {
      const contract = await dispatch('initFungibleTokenContractIfNeeded', contractAddress);

      const { decodedResult } = await contract.methods.total_supply();
      return new BigNumber(decodedResult || 0).toFixed();
    },
    async createOrChangeAllowance(
      { dispatch, state: { sdk } },
      { contractAddress, amount, forAccount = null },
    ) {
      const contract = await dispatch('initFungibleTokenContractIfNeeded', contractAddress);

      const { decodedResult } = await contract.methods.allowance({
        from_account: await sdk.address(),
        for_account: forAccount || process.env.VUE_APP_CONTRACT_V2_ADDRESS.replace('ct_', 'ak_'),
      });

      const allowanceAmount = decodedResult !== undefined
        ? new BigNumber(decodedResult).multipliedBy(-1).plus(amount).toNumber()
        : amount;

      return contract.methods[decodedResult !== undefined ? 'change_allowance' : 'create_allowance'](
        forAccount || process.env.VUE_APP_CONTRACT_V2_ADDRESS.replace('ct_', 'ak_'),
        allowanceAmount,
      );
    },
    async tip({ dispatch, state: { contractV2, contractV1 } }, {
      url,
      title,
      amount,
      tokenAddress = null,
    }) {
      await dispatch('initTippingContractIfNeeded');

      if (tokenAddress && tokenAddress !== 'native') {
        await dispatch('createOrChangeAllowance', { contractAddress: tokenAddress, amount });

        const { decodedResult } = await contractV2.methods
          .tip_token(url, title, tokenAddress, amount);
        return dispatch('backend/awaitTip', `${decodedResult}_v2`, { root: true });
      }

      if (contractV2) {
        const { decodedResult } = await contractV2.methods.tip(url, title, { amount });
        return dispatch('backend/awaitTip', `${decodedResult}_v2`, { root: true });
      }

      await contractV1.methods.tip(url, title, { amount });
      return dispatch('backend/awaitTip', null, { root: true })
        // TODO: remove after solving https://github.com/aeternity/tipping-community-backend/issues/371
        .catch(console.error);
    },
    async retip({
      dispatch,
      state: {
        contractV1,
        contractV2,
      },
    }, {
      contractAddress,
      id,
      amount,
      tokenAddress = null,
    }) {
      await dispatch('initTippingContractIfNeeded');

      if (tokenAddress && tokenAddress !== 'native') {
        await dispatch('createOrChangeAllowance', { contractAddress: tokenAddress, amount });

        const [tipId, contractVersion] = id.split('_');
        const { decodedResult } = await contractV2.methods
          .retip_token(Number(tipId), tokenAddress, amount);
        return dispatch('backend/awaitRetip', `${decodedResult}_${contractVersion}`, { root: true });
      }

      if (contractAddress === process.env.VUE_APP_CONTRACT_V1_ADDRESS) {
        await contractV1.methods.retip(Number(id.split('_')[0]), { amount });
        return dispatch('backend/awaitRetip', null, { root: true })
          // TODO: remove after solving https://github.com/aeternity/tipping-community-backend/issues/371
          .catch(console.error);
      }

      if (contractAddress === process.env.VUE_APP_CONTRACT_V2_ADDRESS) {
        const [tipId, contractVersion] = id.split('_');
        const { decodedResult } = await contractV2.methods.retip(Number(tipId), { amount });
        return dispatch('backend/awaitRetip', `${decodedResult}_${contractVersion}`, { root: true });
      }

      return null;
    },
    async postWithoutTip({ dispatch, state: { contractV3 } }, { title, media }) {
      await dispatch('initTippingContractIfNeeded');

      const { decodedResult } = await contractV3.methods.post_without_tip(title, media);
      return dispatch('backend/awaitTip', `${decodedResult}_v3`, { root: true });
    },
    async postWithoutTipSignature({ state: { sdk } }, { title, media }) {
      const message = tippingContractUtil.postWithoutTippingString(title, media);
      const hash = Crypto.hash(message);
      return sdk.signMessage(hash, { returnHex: true });
    },
  },
};
