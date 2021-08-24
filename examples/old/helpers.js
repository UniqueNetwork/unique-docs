const { Keyring } = require('@polkadot/api');
const { strToUTF16 } = require('./util');

module.exports.privateKey = (account) => {
  const keyring = new Keyring({ type: 'sr25519' });

  return keyring.addFromUri(account);
}

function submitTransactionAsync(sender, transaction) {
  return new Promise(async function (resolve, reject) {
    try {
      await transaction.signAndSend(sender, ({ events = [], status }) => {
        if (status.isInBlock || status.isFinalized) {
          resolve(events);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * @param {string} name
 * @returns {void}
 */
function getGenericResult(events) {
  if (!events.some(({ event: { method } }) => method === 'ExtrinsicSuccess')) {
    throw new Error(`extrinsic failed`);
  }
}
/**
 * @param {any[]} events
 * @returns {number} collectionId
 */
function getCreateCollectionResult(events) {
  const creationEvent = events.find(({ event: { method, section } }) => section === 'nft' && method === 'Created');
  if (!creationEvent) {
    throw new Error('collection creation failed');
  }
  return +creationEvent.event.data[0].toString();
}
/**
 * @param {any[]}
 * @returns {number}
 */
function getCreateItemResult(events) {
  const creationEvent = events.find(({ event: { method, section } }) => section === 'nft' && method === 'ItemCreated');
  if (!creationEvent) {
    throw new Error('item creation failed');
  }
  return +creationEvent.event.data[1].toString();
}
/**
 * @param {any[]}
 * @returns {number[]}
 */
function getCreateMultipleItemsResult(events) {
  const ids = events.filter(({ event: { method, section } }) => section === 'nft' && method === 'ItemCreated').map(e => +e.event.data[1].toString());
  if (ids.length === 0) {
    throw new Error('items creation failed');
  }
  return ids;
}
/**
 * @param {any[]}
 * @returns {number[]}
 */
function getCreateMultipleItemsResult(events) {
  return events.filter(({ event: { method, section } }) => section === 'nft' && method === 'ItemCreated').map(e => +e.event.data[1].toString());
}

function createTxWrapper(txGetter, resultGetter, patchArgs = a => a) {
  return async (api, privateKey, ...txArgs) => {
    patchArgs(txArgs);
    const tx = txGetter(api)(...txArgs);
    const events = await submitTransactionAsync(privateKey, tx);
    const result = resultGetter(events);
    return result;
  };
}

/**
 * @param {string} name
 * @param {(events: any[]) => T} resultGetter
 * @param {(args: A) => A} patchArgs
 * @returns {(api, sender, ...args: A) => Promise<T>}
 * @template A
 * @template T
 */
function createTxNftWrapper(name, resultGetter, patchArgs = a => a) {
  return createTxWrapper(api => api.tx.nft[name], resultGetter, patchArgs);
}

module.exports.createCollection = createTxNftWrapper('createCollection', getCreateCollectionResult, args => {
  args[0] = strToUTF16(args[0]);
  args[1] = strToUTF16(args[1]);
  args[2] = strToUTF16(args[2]);
});
module.exports.destroyCollection = createTxNftWrapper('destroyCollection', getGenericResult);
module.exports.setCollectionSponsor = createTxNftWrapper('setCollectionSponsor', getGenericResult);
module.exports.removeCollectionSponsor = createTxNftWrapper('removeCollectionSponsor', getGenericResult);
module.exports.confirmSponsorship = createTxNftWrapper('confirmSponsorship', getGenericResult);
module.exports.createItem = createTxNftWrapper('createItem', getCreateItemResult);
module.exports.burnItem = createTxNftWrapper('burnItem', getGenericResult);
module.exports.createMultipleItems = createTxNftWrapper('createMultipleItems', getCreateMultipleItemsResult);
module.exports.setPublicAccessMode = createTxNftWrapper('setPublicAccessMode', getGenericResult);
module.exports.setMintPermission = createTxNftWrapper('setMintPermission', getGenericResult);
module.exports.addToWhiteList = createTxNftWrapper('addToWhiteList', getGenericResult);
