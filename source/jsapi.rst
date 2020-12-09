JavaScript API
==============

Polkadot JS API
---------------
The `Polkadot JS API <https://polkadot.js.org/docs/api/>`_ is a constantly developed API for integration with Substrate based blockchains, which is maintained by Parity Inc.

This documentation does not focus on general features of this API, but mainly on using this API for integration with features of Unique Blockchain.

Installation
------------
The Polkadot JS API is available as an npm package and can be included in `package.json` file as::

    "@polkadot/api": "2.9.1",

Examples
--------

The examples are provided for this documentation in the `examples folder <https://github.com/usetech-llc/unique-docs/tree/master/examples/>`_. In order to execute them, install NodeJS 15, clone this repository and run an example (e.g. connect.js)::

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

Collection Management
---------------------

createCollection
^^^^^^^^^^^^^^^^

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

changeCollectionOwner
^^^^^^^^^^^^^^^^^^^^^

**Description**

Change the owner of the collection

**Permissions**

* Collection Owner

**Parameters**

* CollectionId - ID of the collection to change owner for
* NewOwner - new collection owner


destroyCollection
^^^^^^^^^^^^^^^^^

**Description**

DANGEROUS: Destroys collection and all NFTs within this collection. Users irrecoverably lose their assets and may lose real money.

**Permissions**

* Collection Owner

**Parameters**

* CollectionId - ID of the collection to destroy


createItem (Mint)
^^^^^^^^^^^^^^^^^

**Description**

This method creates a concrete instance of NFT Collection created with createCollection method.

**Permissions**

* Collection Owner
* Collection Admin
* Anyone, if 

    * White List is enabled, and
    * Address is added to white list, and
    * MintPermission is enabled (see setMintPermission method)

**Parameters**

* CollectionID: ID of the collection
* Properties: Array of bytes that contains NFT properties. Since NFT Module is agnostic of properties’ meaning, it is treated purely as an array of bytes
* Owner: Address, initial owner of the NFT

**Events**

* ItemCreated
    * ItemId: Identifier of newly created NFT, which is unique within the Collection, so the NFT is uniquely identified with a pair of values: CollectionId and ItemId.


createMultipleItems
^^^^^^^^^^^^^^^^^^^

**Description**

This method creates multiple instances of NFT Collection created with createCollection method.

**Permissions**

* Collection Owner
* Collection Admin
* Anyone, if 

    * White List is enabled, and
    * Address is added to white list, and
    * MintPermission is enabled (see setMintPermission method)

**Parameters**

* CollectionID: ID of the collection
* Properties: Array of properties with one element for each created NFT. One element of this array is an array of bytes that contains NFT properties. Since NFT Module is agnostic of properties’ meaning, it is treated purely as an array of bytes.
* Owner: Address, initial owner of all NFTs created in this transaction

**Events**

One `ItemCreated` event is emitted for each created NFT 

* ItemCreated
    * ItemId: Identifier of newly created NFT, which is unique within the Collection, so the NFT is uniquely identified with a pair of values: CollectionId and ItemId.


burnItem
^^^^^^^^

Item Ownership and Transfers
----------------------------

This group of methods allows managing NFT ownership.

Getting NFT Owner
^^^^^^^^^^^^^^^^^

Getting BalanceOf
^^^^^^^^^^^^^^^^^

transfer
^^^^^^^^

transferFrom
^^^^^^^^^^^^

approve
^^^^^^^

Data Schema
-----------

setSchemaVersion
^^^^^^^^^^^^^^^^

setOffchainSchema
^^^^^^^^^^^^^^^^^

setConstOnChainSchema
^^^^^^^^^^^^^^^^^^^^^

setVariableOnChainSchema
^^^^^^^^^^^^^^^^^^^^^^^^

