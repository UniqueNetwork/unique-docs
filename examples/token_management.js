const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const config = require("./config");
const {} = require("./helpers");

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

async function createMultipleItems(api, collectionId) {

}

async function main() {
  const api = await getUniqueConnection();

  // Create an NFT collection for this example


  await createMultipleItems();

  api.disconnect();
}

main().catch(console.error).finally(() => process.exit());
