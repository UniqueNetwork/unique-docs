const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const config = require("./config");

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

async function main() {
  const api = await getUniqueConnection();
  const network = await api.rpc.system.chain();

  console.log(`Connected to network: ${network}`);

  api.disconnect();
}

main().catch(console.error).finally(() => process.exit());
