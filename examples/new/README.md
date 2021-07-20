
# README

Unique Network blockchain in the Polkadot ecosystem can be seen as a foundation for standards and good practices serving for any software that uses or relates to NFT. The core components of Unique blockchain are:
- NFT Pallet
- Ink! Smart Contracts

## [Create Accounts](#create_accounts)

[Unique Network](https://unique.network/), like most blockchains, is based on accounts or addresses. An address can own NFTs or some Unique token. It can sign transactions to transfer these valuable assets to other addresses or to make some actions in Decentralized Apps (dApps). For example, an address can buy and sell NFTs on the NFT Market.
****
The typical Unique address looks like this:
```text
5HEfXSCByZ9jgtrfSEQNnRSgRVf4wxiTyTzBME5xsjyNqak3
```

[More details](https://unique-network.readthedocs.io/en/latest/gettingstarted.html)

## [Opening Connection](#open_connection)

The Unique Network maintains public blockchain nodes to be used by clients for free. In order to connect to a client, you will need the public node URL and runtime types file that is located at
[runtime_types.json](https://github.com/usetech-llc/unique-docs/tree/master/examples/config/runtime_types.json)

```js
const { ApiPromise, WsProvider } = require('@polkadot/api');
const rtt = require("./runtime_types.json");

const wsProvider = new WsProvider(public_node_url);
const api = new ApiPromise({ provider: wsProvider, types: rtt });

await api.isReady
```


## Collection

### [createCollection](#create_collection)

This method creates a Collection of NFTs. Each Token may have multiple properties encoded as an array of bytes of certain length. The initial owner and admin of the collection are set to the address that signed the transaction. Both addresses can be changed later.

in `index.js`
```js
  const configCollection = {
      name: 'test',
      description: 'test',
      tokenPrefix: 'test'
  };

  await api.createCollection(configCollection);
```
#### Parameters
- collectionName: UTF-16 string with collection name (limit 64 characters)
- collectionDescription: UTF-16 string with collection description (limit 256 characters)
- tokenPrefix: UTF-8 string with token prefix, limit 16 characters
- collectionType:
  - 0 - Invalid (collection does not exist, if type is 0)
  - 1 - NFT. All items in ItemList are unique and indivisible (decimalPoints parameter must be 0). Item IDs are unique, and one item may only be owned by one address.
  - 2 - Fungible. Collection does not have custom data associated with token (custom data size parameter must be 0). All Item IDs are the same and all that is recorded in ItemList in value field is the owner address and owned amount. The value is fixed point decimal with decimalPoints set as in the parameter to this method.
  - 3 - Re-Fungible. Custom data is allowed, but Items IDs are not unique. One item may be owned by more than one address. Value in ItemList entry corresponds to the owned portion of token. Value is an integer number and corresponds to the number of owned pieces.
- decimalPoints: Decimal points to be used in token amounts. If set to 0, tokens are indivisible.

[More details](https://unique-network.readthedocs.io/en/latest/jsapi.html?#createcollection)

### Sets some collection limits and starts enforcing them immediately (with no exception for collection owner or admins).
in `index.js`
```js
  await api.setCollectionLimits(LIMIT_TOKEN);
```
[More details](https://unique-network.readthedocs.io/en/latest/jsapi.html?highlight=setCollectionLimits#setcollectionlimits)

### Set the on-chain schema (string in JSON-schema format) that describes permanent token fields.
in `index.js`
```js
  await api.setConstOnChainSchema(schema);    
```
[More details](https://unique-network.readthedocs.io/en/latest/jsapi.html#setconstonchainschema)

### Set off-chain data schema. In the initial version of NFT parachain the schema will only reflect image URL. The {id} substring will be parsed to reflect the NFT id.
in `index.js`
```js
  await api.setOffchainSchema(galleryURL)  
```

[More details](https://unique-network.readthedocs.io/en/latest/jsapi.html#setoffchainschema)

## Token

### [createItem](#createItem)

This method creates a concrete instance of NFT, Fungible, or ReFungible Collection created with [createCollection](https://unique-network.readthedocs.io/en/latest/jsapi.html#createcollection) method.

#### Permissions
- Collection Owner
- Collection Admin
- Anyone, if
  - White List is enabled, and
  - Address is added to white list, and
  - MintPermission is enabled (see setMintPermission method)

#### Parameters
- CollectionID: ID of the collection
- Owner: Address, initial owner of the token
- Properties: Depends on collection type
  - NFT: Arrays of bytes that contain NFT properties. Since NFT Module is agnostic of properties’ meaning, it is treated purely as an array of bytes.
  - Fungible: Amount to create (multiplied by 10 to the decimalPoints power. E.g. if decimalPoints equals 2, number 301 creates 3.01 tokens)
  - ReFungible
    - const_data: Immutable properties
    - variable_data: Mutable properties
    - pieces: Number of pieces this token is divided into
  
in `index.js`
```js
    const serializeItem = protobuff.serializeNFT(item);     
     const token = {
       buffer: serializeItem,
       owner,
       collectionId
     }
    await api.createItem(token);
```

[More complete examples](https://github.com/usetech-llc/unique-docs/blob/master/examples/token_management.js)

[More details](https://unique-network.readthedocs.io/en/latest/jsapi.html?highlight=setCollectionLimits#createitem-mint)


## Configuration example

Configuration can be done through the environment:

| Env | Description | Default |
|--|--| -- |
| WSENDPOINT | The public node URL depends on the network that you would like to connect |  wss://testnet2.uniquenetwork.io |
| SEED | This mnemonic seed can also be used to sign transactions in JavaScript code. In the examples we use the mnemonic seed for Alice account (seed: “//Alice”), but you can replace it with your seed to work with TestNet or MainNet.| //Alice |
| GALLERY_URL | In the initial version of NFT parachain the schema will only reflect image URL. The {id} substring will be parsed to reflect the NFT id. | `https://img.cryptokitties.co/test/{id}.png` |
| COLLECTION_ID | ID of the collection | |
| OWNER | Address, initial owner of the token | |
| SCHEMA | This schema describes the serialization of non-changeable token fields. |  `{ nested: { onchainmetadata: { nested: { NFTMeta: { fields: { name: { id: 1, rule: 'required', type: 'string', } }, }, }, }, }, }` |    
| RUNTIME_TYPES | link on `runtime_type.json`  | `./config/runtime_types.json` |
| LIMIT_TOKEN | total amount of tokens that can be minted in this collection | 10 |

or you can change the file  `config.js` in this section of the code:
```js
  #endpoint = process.env.WSENDPOINT || 'wss://testnet2.uniquenetwork.io'
  
  #seed = process.env.SEED || '//Alice'

  #galleryUrl = process.env.GALLERY_URL || 'https://img.cryptokitties.co/test/{id}.png'

  #collectionId = process.env.COLLECTION_ID || 1;
  
  #owner = process.env.OWNER || '';

  #schema = process.env.SCHEMA || this.#getSchema();

  #runtime_types = process.env.RUNTIME_TYPES || './config/runtime_types.json';

  #limitToken = process.env.LIMIT_TOKEN || 10;
```

## How to launch the example

Change the configuration to meet your requirements.

And run the command:
```bash
node ./index.js
```