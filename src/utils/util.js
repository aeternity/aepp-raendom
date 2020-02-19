import BigNumber from 'bignumber.js'

const atomsToAe = (atoms) => (new BigNumber(atoms)).dividedBy(new BigNumber(1000000000000000000));
const aeToAtoms = (ae) => (new BigNumber(ae)).times(new BigNumber(1000000000000000000));
export const wrapTry = async (f) => {
  try {
    return Promise.race([
      f().then(res => {
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        return res.json()
      }),
      new Promise(function (resolve, reject) {
        setTimeout(reject, 8000, 'TIMEOUT');
      })
    ])
  } catch (e) {
    console.error("backend error", e);
    return null;
  }
}

export default {
  atomsToAe,
  aeToAtoms,
  wrapTry
}
