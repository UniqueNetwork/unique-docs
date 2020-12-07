JavaScript API
==============

Polkadot JS API
---------------
The .. _Polkadot JS API: https://polkadot.js.org/docs/api/ is a constantly developed API for integration with Substrate based blockchains, which is maintained by Parity Inc.

This documentation does not focus on general features of this API, but mainly on using this API for integration with features of Unique Blockchain.

Installation
------------
The Polkadot JS API is available as an npm package and can be included in `package.json` file as::

    "@polkadot/api": "2.9.1",

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
    const fs = require('fs');

    const wsProvider = new WsProvider(public_node_url);
    const rtt = JSON.parse(fs.readFileSync("runtime_types.json"));

    // Create the API and wait until ready
    const api = await ApiPromise.create({ 
        provider: wsProvider,
        types: rtt
    });


Creating Collection
-------------------

Here is some code::

    await api.tx.nft.createCollection();


Minting Tokens
--------------

alsdkjflafd
