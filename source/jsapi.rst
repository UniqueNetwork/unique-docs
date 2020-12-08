JavaScript API
==============

Polkadot JS API
---------------
The `Polkadot JS API: https://polkadot.js.org/docs/api/`_ is a constantly developed API for integration with Substrate based blockchains, which is maintained by Parity Inc.

This documentation does not focus on general features of this API, but mainly on using this API for integration with features of Unique Blockchain.

Installation
------------
The Polkadot JS API is available as an npm package and can be included in `package.json` file as::

    "@polkadot/api": "2.9.1",

Examples
--------

The examples are provided for this documentation in the `examples: https://github.com/usetech-llc/unique-docs/tree/master/examples`_ folder. In order to execute them, install NodeJS 15, clone this repository and run an example (e.g. connect.js)::

    cd examples
    npm install
    node connect.js 

Opening Connection
------------------

The Unique Network maintains public blockchain nodes to be used by clients for free. In order to connect to a client, you will need the public node URL and runtime types file that is located at https://github.com/usetech-llc/nft_parachain/runtime_types.json.

The public node URL depends on the network that you would like to connect to:

+-------------+---------------------------+
| Network     | URL                       |
+=============+===========================+
| TestNet 1.0 | wss://unique.usetech.com  |
+-------------+---------------------------+
| TestNet 2.0 | Coming soonest..          |
+-------------+---------------------------+
| MainNet     | Coming soon...            |
+-------------+---------------------------+

Once you've got all parameters, connect to the node like this::

    const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
    const rtt = require("./runtime_types.json");

    const wsProvider = new WsProvider(public_node_url);

    // Create the API and wait until ready
    const api = await ApiPromise.create({ 
        provider: wsProvider,
        types: rtt
    });


Creating Collection
-------------------

**Description**

This method creates a Collection of NFTs. Each Token may have multiple properties encoded as an array of bytes of certain length. The initial owner and admin of the collection are set to the address that signed the transaction. Both addresses can be changed later.

**Permissions**

* Anyone

**Parameters**

* collectionName: UTF-16 string with collection name (limit 64 characters), will be stored as zero-terminated 
* collectionDescription: UTF-16 string with collection description (limit 256 characters), will be stored as zero-terminated 
* tokenPrefix: UTF-8 string with token prefix, limit 16 characters, will be stored as zero-terminated
* collectionType:

    * 0 - Invalid (collection does not exist, if type is 0)
    * 1 - NFT. All items in ItemList are unique and indivisible (decimalPoints parameter must be 0). Item IDs are unique, and one item may only be owned by one address.
    * 2 - Fungible. Collection does not have custom data associated with token (custom data size parameter must be 0). All Item IDs are the same and all that is recorded in ItemList in value field is the owner address and owned amount. The value is fixed point decimal with decimalPoints set as in the parameter to this method.
    * 3 - Re-Fungible. Custom data is allowed, but Items IDs are not unique. One item may be owned by more than one address. Value in ItemList entry corresponds to the owned portion of token. Value is a decimal fixed point number and may have values from 0 to 1 (excluding 0, since in that case the entry must be removed from the dictionary).
* decimalPoints: Decimal points to be used in token amounts. If set to 0, the tokens are indivisible.

**Events**

* CollectionCreated
    * CollectionID: Globally unique identifier of newly created collection.
    * Owner: Collection owner



Here is some code::

    await api.tx.nft.createCollection();


Minting Tokens
--------------

alsdkjflafd
