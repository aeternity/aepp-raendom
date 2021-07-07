import { get } from 'lodash-es';
import BigNumber from 'bignumber.js';
import isFQDN from 'is-fqdn';
import i18n from './i18nHelper';

export const topicsRegex = /(#[a-zA-Z]+\b)(?!;)/g;

export const shiftDecimalPlaces = (amount, decimals) => new BigNumber(amount).shiftedBy(decimals);

export const currencySigns = {
  eur: '€',
  usd: '$',
  cny: '¥',
};

export const IS_MOBILE_DEVICE = window.navigator.userAgent.includes('Mobi');

export const createDeepLinkUrl = ({ type, ...params }) => {
  const url = new URL(`${process.env.VUE_APP_WALLET_URL}/${type}`);
  url.searchParams.set('x-success', window.location);
  url.searchParams.set('x-cancel', window.location);
  Object.entries(params)
    .filter(([, value]) => ![undefined, null].includes(value))
    .forEach(([name, value]) => url.searchParams.set(name, value));
  return url;
};

export const toURL = (url) => new URL(url.includes('://') ? url : `https://${url}`);

export const validateTipUrl = (urlAsString) => {
  try {
    const url = toURL(urlAsString);
    return ['http:', 'https:'].includes(url.protocol) && isFQDN(url.hostname);
  } catch (e) {
    return false;
  }
};

const getTwitterAccountUrl = (url) => {
  const match = url.match(/https:\/\/twitter.com\/[a-zA-Z0-9_]+/g);
  return match ? match[0] : false;
};

export const urlStatus = (tipUrl, verifiedUrls, blacklistedUrls) => {
  if (!tipUrl) return 'default';
  const twitterProfile = getTwitterAccountUrl(tipUrl);
  const url = twitterProfile || tipUrl;

  if (blacklistedUrls.some((u) => url.includes(u))) return 'blacklisted';
  if (verifiedUrls.includes(url)) return 'verified';
  if (validateTipUrl(url) && url.startsWith('http:')) return 'not-secure';
  return 'not-verified';
};

export const isTitle = (index, page) => !!get(i18n.t(`views.${page}.sections[${index}]`), 'title');

export const getI18nPath = (index, page) => (isTitle(index, page)
  ? `views.${page}.sections[${index}].title`
  : `views.${page}.sections[${index}].text`);

export const handleUnknownError = (error) => console.warn('Unknown rejection', error);

export const blockToDate = (goalBlock, height) => {
  const diff = goalBlock - height;
  return new Date(diff * 180000 + Date.now());
};

export const fetchJson = async (...args) => {
  const response = await fetch(...args);
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json();
};
