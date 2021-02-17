const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const config = require("./config");
const { privateKey, createCollection, createItem, createMultipleItems, burnItem } = require("./helpers");

var BigNumber = require('bignumber.js');
BigNumber.config({ DECIMAL_PLACES: 12, ROUNDING_MODE: BigNumber.ROUND_DOWN, decimalSeparator: '.' });

const rtt = require("./runtime_types.json");

async function getUniqueConnection() {

  // Initialise the provider to connect to the node
  const wsProvider = new WsProvider(config.wsEndpoint);

  // Create the API and wait until ready
  const api = await ApiPromise.create({
    provider: wsProvider,
    types: rtt,
  });

  return api;
}

async function nftManagementExample(api) {
  const alice = privateKey('//Alice');
  const nftCollectionId = await createCollection(api, alice, 'name', 'description', 'prefix', { nft: null });
  console.log('New NFT collection', nftCollectionId);

  const nftItemId = await createItem(
    api,
    alice,
    nftCollectionId,
    // Token receiver
    alice.address,
    {
      nft: {
        // Arbitary data assigned to token
        const_data: [1, 2, 3, 4],
        // Variable data can be set later with setVariableMetadata
        variable_data: [1, 2, 3, 4],
      },
    }
  );
  console.log('New NFT', nftItemId);

  await burnItem(api, alice, nftCollectionId, nftItemId, 1);
  console.log('Token', nftItemId, 'no longer exists');

  const nftItemIds = await createMultipleItems(api, alice, nftCollectionId, alice.address, [
    { nft: {} },
    { nft: {} },
    { nft: {} },
  ]);
  console.log('New NFTs', nftItemIds);
}

async function refungibleManagementExample(api) {
  const alice = privateKey('//Alice');
  const refungibleCollectionId = await createCollection(api, alice, 'name', 'description', 'prefix', { refungible: null });
  console.log('New refungible collection', refungibleCollectionId);

  const refungibleItemId = await createItem(api, alice, refungibleCollectionId, alice.address, {
    refungible: {
      const_data: [],
      variable_data: [],
      pieces: 100,
    },
  });
  console.log('New refungible', refungibleItemId);

  await burnItem(api, alice, refungibleCollectionId, refungibleItemId, 40);
  console.log('Part of refungible', refungibleItemId, 'were burned');

  const refungibleItemIds = await createMultipleItems(api, alice, refungibleCollectionId, alice.address, [
    { refungible: { pieces: 10 } },
    { refungible: { pieces: 10 } },
    { refungible: { pieces: 10 } },
  ]);
  console.log('New refungibles', refungibleItemIds);
}

async function fungibleManagementExample(api) {
  const alice = privateKey('//Alice');
  const fungibleCollectionId = await createCollection(api, alice, 'name', 'description', 'prefix', {
    // Decimals
    fungible: 20
  });
  console.log('New fungible token', fungibleCollectionId);

  await createItem(api, alice, fungibleCollectionId, alice.address, {
    fungible: {
      // Amount
      value: 50,
    },
  });
  console.log('Given fungibles');

  await burnItem(api, alice, fungibleCollectionId, 1, 20);
  console.log('Some fungibles were burned');
}

async function main() {
  const api = await getUniqueConnection();

  await nftManagementExample(api);
  await refungibleManagementExample(api);
  await fungibleManagementExample(api);

  api.disconnect();
}

main().catch(console.error).finally(() => process.exit());
