import { fetchJson } from '.';

const backendFetch = (path, ...args) => fetchJson(
  `${process.env.VUE_APP_BACKEND_URL}/${path}`, ...args,
);

export default class Backend {
  static getTipComments = async (tipId) => backendFetch(`comment/api/tip/${encodeURIComponent(tipId)}`);

  static sendTipComment = async (_, postParam) => backendFetch('comment/api/', {
    method: 'post',
    body: JSON.stringify(postParam),
    headers: { 'Content-Type': 'application/json' },
  });

  static getUserComments = async (address) => backendFetch(`comment/api/author/${address}`);

  static pinItem = async (address, postParam) => backendFetch(`pin/${address}`, {
    method: 'post',
    body: JSON.stringify(postParam),
    headers: { 'Content-Type': 'application/json' },
  });

  static unPinItem = async (address, postParam) => backendFetch(`pin/${address}`, {
    method: 'delete',
    body: JSON.stringify(postParam),
    headers: { 'Content-Type': 'application/json' },
  });

  static getPinnedItems = async (address) => backendFetch(`pin/${address}`);

  static getProfile = async (address) => backendFetch(`profile/${address}`);

  static sendProfileData = async (address, postParam) => backendFetch(`profile/${address}`, {
    method: 'post',
    ...postParam instanceof FormData
      ? { body: postParam }
      : {
        body: JSON.stringify(postParam),
        headers: { 'Content-Type': 'application/json' },
      },
  });

  static setImage = async (address, data) => {
    const request = {
      method: 'post',
      body: data,
    };
    return backendFetch(`profile/${address}`, request);
  };

  static claimFromUrl = async (postParam) => backendFetch('claim/submit', {
    method: 'post',
    body: JSON.stringify(postParam),
    headers: { 'Content-Type': 'application/json' },
  });

  static sendPostReport = async (author, postParam) => backendFetch('blacklist/api/wallet', {
    method: 'post',
    body: JSON.stringify({ ...postParam, author }),
    headers: { 'Content-Type': 'application/json' },
  });

  static getProfileImageUrl = (address) => `${process.env.VUE_APP_BACKEND_URL}/profile/image/${address}`;

  static getStats = async () => backendFetch('static/stats/');

  static getTipById = async (id) => backendFetch(`tips/single/${id}`);

  static getSenderStats = async (address) => backendFetch(`stats/sender?address=${address}`)

  static getFeed = async (
    page,
    ordering,
    address = null,
    search = null,
    blacklist = true,
    tips = true,
    posts = true,
  ) => {
    let query = `?ordering=${ordering}&page=${page}`;
    if (tips) query += '&contractVersion=v1&contractVersion=v2';
    if (posts) query += '&contractVersion=v3';
    if (address) query += `&address=${address}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    query += `&blacklist=${blacklist}`;
    // soon change 'tips' to 'feed'
    return backendFetch(`tips${query}`);
  };

  static addToken = async (address) => backendFetch('tokenCache/addToken', {
    method: 'post',
    body: JSON.stringify({ address }),
    headers: { 'Content-Type': 'application/json' },
  });

  static getTipStats = async () => backendFetch('stats');

  static getCacheChainNames = async () => backendFetch('cache/chainnames');

  static getPrice = async () => backendFetch('cache/price');

  static getTopics = async () => backendFetch('tips/topics');

  static getTokenInfo = async () => backendFetch('tokenCache/tokenInfo');

  static getWordRegistry = async (ordering, direction, search) => {
    const queryParams = new URLSearchParams();
    if (ordering) queryParams.set('ordering', ordering);
    if (direction) queryParams.set('direction', direction);
    if (search) queryParams.set('search', search);
    return process.env.VUE_APP_CONTRACT_V2_ADDRESS
      ? backendFetch(`tokenCache/wordRegistry?${queryParams.toString()}`) : Promise.resolve([]);
  }

  static getWordSaleVotesDetails = async (address) => backendFetch(`tokenCache/wordSaleVotesDetails/${address}`);

  static getWordSaleDetailsByToken = async (address) => backendFetch(`tokenCache/wordSaleByToken/${address}`);

  static getWordSale = async (address) => backendFetch(`tokenCache/wordSale/${address}`);

  static getPriceHistory = async (address) => backendFetch(`tokenCache/priceHistory/${address}`);

  static getTokenBalances = async (address) => backendFetch(`tokenCache/balances?address=${address}`);

  static awaitTip = async (id) => backendFetch(`tips/await/tip/${id || 'v1'}`);

  static awaitRetip = async (id) => backendFetch(`tips/await/retip/${id || 'v1'}`);

  static invalidateTokenCache = async (token) => backendFetch(`cache/invalidate/token/${token}`);

  static invalidateWordSaleCache = async (wordSale) => backendFetch(`cache/invalidate/wordSale/${wordSale}`);

  static invalidateWordRegistryCache = async () => backendFetch('cache/invalidate/wordRegistry');

  static invalidateWordSaleVotesCache = async (wordSale) => backendFetch(`cache/invalidate/wordSaleVotes/${wordSale}`);

  static invalidateWordSaleVoteStateCache = async (vote) => backendFetch(`cache/invalidate/wordSaleVoteState/${vote}`);

  static getTipPreviewUrl = (previewLink) => `${process.env.VUE_APP_BACKEND_URL}${previewLink}`;

  static getCommentById = async (id) => backendFetch(`comment/api/${id}`);

  static getVerifiedUrls = async () => backendFetch('verified');

  static getGrayListedUrls = async () => backendFetch('static/wallet/graylist');

  static getTipTraceBackend = (id) => backendFetch(`tracing/backend?id=${id}`);

  static getTipTraceBlockchain = (id) => backendFetch(`tracing/blockchain?id=${id}`);

  static getCookiesConsent = async (address, query) => backendFetch(`consent/${address}${query ? `?challenge=${query.challenge}&signature=${query.signature}` : ''}`);

  static setCookiesConsent = async (address, { scope, status }) => backendFetch(`consent/${address}/${scope}`, {
    method: 'post',
    body: JSON.stringify({ status: status ? 'ALLOWED' : 'REJECTED' }),
    headers: { 'Content-Type': 'application/json' },
  });

  static sendPostWithoutTip = async (postParam) => backendFetch('payfortx/post', {
    method: 'post',
    body: JSON.stringify(postParam),
    headers: { 'Content-Type': 'application/json' },
  });
}
