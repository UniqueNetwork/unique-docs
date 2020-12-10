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



**Code example**

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

setMetaData
^^^^^^^^^^^

**Description**

Update token custom data (the changeable part).

**Permissions**

* Collection Owner
* Collection Admin
* Current NFT Owner

**Parameters**

* CollectionID: ID of the collection
* ItemID: ID of NFT to burn


addCollectionAdmin
^^^^^^^^^^^^^^^^^^

**Description**

NFT Collection can be controlled by multiple admin addresses (some which can also be servers, for example). Admins can issue and burn NFTs, as well as add and remove other admins, but cannot change NFT or Collection ownership.

This method adds an admin of the Collection.

**Permissions**

* Collection Owner
* Collection Admin

**Parameters**

* CollectionID: ID of the Collection to add admin for
* Admin: Address of new admin to add

removeCollectionAdmin
^^^^^^^^^^^^^^^^^^^^^

**Description**

Remove admin address of the Collection. An admin address can remove itself. List of admins may become empty, in which case only Collection Owner will be able to add an Admin.

**Permissions**

* Collection Owner
* Collection Admin

**Parameters**

* CollectionID: ID of the Collection to remove admin for
* Admin: Address of admin to remove

setPublicAccessMode
^^^^^^^^^^^^^^^^^^^

**Description**

Toggle between normal and white list access for the methods with access for “Anyone”.

**Permissions**

Collection Owner

**Parameters**

* CollectionID: ID of the Collection to remove admin for
* Mode
    * 0 = Normal
    * 1 = White list

addToWhiteList
^^^^^^^^^^^^^^

**Description**

Add an address to white list.

**Permissions**

* Collection Owner
* Collection Admin

**Parameters**
* CollectionID: ID of the Collection
* Address

removeFromWhiteList
^^^^^^^^^^^^^^^^^^^

**Description**

Remove an address from white list.

**Permissions**

* Collection Owner
* Collection Admin

**Parameters**

* CollectionID: ID of the Collection
* Address

setMintPermission
^^^^^^^^^^^^^^^^^

**Description**

Allows Anyone to create tokens if:

    * White List is enabled, and
    * Address is added to white list, and
    * This method was called with True parameter

**Permissions**

* Collection Owner

**Parameters**

* CollectionID: ID of the Collection to add admin for
* MintPermission: Boolean parameter. If True, allows minting to Anyone with conditions above.

setCollectionLimits
^^^^^^^^^^^^^^^^^^^

**Description**

Sets some collection limits and starts enforcing them immediately:

    * `account_token_ownership_limit` - Maximum number of tokens that one address can own. Default value is 0 (not limited), maximum value is 10,000,000.
    * `nft_sponsor_transfer_timeout` - Time interval in blocks that defines once per how long a transfer transaction can be sponsored. Default value is 14400 (24 hrs), allowed values are from 0 (not limited) to 10,368,000 (1 month). 
    * `fungible_sponsor_transfer_timeout` - same for fungible transfers
    * `refungible_sponsor_transfer_timeout` - same for refungible transfers
    * `token_limit`  - total amount of tokens that can be minted in this collection. It can only be set if the current value is not 0. Default value is 0 (unlimited). If the value is not set (equals to default), the number of tokens is not limited until this limit is set. When the limit is set, the NFT pallet will check if the number of minted tokens is less or equal than the parameter value. If the number of minted tokens is greater than this number, the transaction will fail.
    * `sponsored_mint_size` - maximum byte size of custom NFT data that can be sponsored when tokens are minted in sponsored mode. If the amount of custom data is greater than this parameter when tokens are minted, then the transaction sender will pay transaction fees when minting tokens.

**Permissions**

* Collection Owner

**Parameters**

* CollectionLimits structure (see the description of parameters above)



Token Management
---------------------

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
    * CollectionID: ID of collection
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
    * CollectionID: ID of collection
    * ItemId: Identifier of newly created NFT, which is unique within the Collection, so the NFT is uniquely identified with a pair of values: CollectionId and ItemId.


burnItem
^^^^^^^^

**Description**

This method destroys a concrete instance of NFT.

**Permissions**

* Collection Owner
* Collection Admin
* Current NFT Owner

**Parameters**

* CollectionID: ID of the collection
* ItemID: ID of NFT to burn

**Events**

* ItemDestroyed
    * CollectionID: ID of collection
    * ItemId: Identifier of burned NFT

Getting Token Information
^^^^^^^^^^^^^^^^^^^^^^^^^

In order to get the NFT or Re-fungible token information, one should use

* `api.query.nft.nftItemList` query for Non-Fungible items
* `api.query.nft.reFungibleItemList` query for Re-Fungible items

**Parameters**

* CollectionID: Id of collection 
* ItemID: token Id

The API will return the JSON structure in the following format that contains ::

    {
      Collection: 4,
      Owner: 5FZeTmbZQZsJcyEevjGVK1HHkcKfWBYxWpbgEffQ2M1SqAnP,
      Data: 0x0001000311ffffffffffffffffffffffffffffff
    }






Token Ownership and Transfers
----------------------------

This group of methods allows managing NFT ownership.


Getting BalanceOf
^^^^^^^^^^^^^^^^^

In order to get the NFT or Re-fungible balance for an address, one should use `api.query.nft.balance`

**Parameters**

* CollectionID: Id of collection 
* AccountId: user address


Getting Address Tokens
^^^^^^^^^^^^^^^^^^^^^^

In order to get the list of NFT or Re-fungible tokens that are owned by a single address, one should use `api.query.nft.addressTokens`

**Parameters**

* CollectionID: Id of collection 
* AccountId: user address

Transfer Checks
^^^^^^^^^^^^^^^

This algorithm is used to check if the address can transfer, approve, transferFrom, and burn a token:

#. Check ownership and/or approvals (If not -> Error. If yes -> go next.)

    #. Transfer, Approve, and Burn: Check if the sender owns the token, or 
    #. TransferFrom: Check if the sender is approved to transfer this token. Collection Owner, Admins, and this token owner are always approved.
#. Check if the sender is the collection owner or an admin. If yes -> Allow transaction, no extra checks needed. If no -> go next.
#. Check if White List mode is enabled. If no -> Allow transaction, no extra checks needed. If yes -> go next.
#. Check if the sender is in the white list. If yes -> Allow transaction, no extra checks needed. If no -> Error.


transfer
^^^^^^^^

**Description**

Change ownership of the token.

**Permissions**

* Collection Owner
* Collection Admin
* Current NFT owner

**Parameters**

* Recipient: Address of token recipient
* CollectionId: ID of collection
* ItemId: ID of the item

    * Non-Fungible Mode: Required
    * Fungible Mode: Ignored
    * Re-Fungible Mode: Required
* Value (Optional): Amount to transfer

    * Non-Fungible Mode: Ignored
    * Fungible Mode: Must specify transferred amount
    * Re-Fungible Mode: Must specify transferred portion (between 0 and 1)


transferWithData (not yet available)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

Same as Transfer with extra parameter: Data, an array of bytes. Data will be emitted in an event.

**Permissions**

Same as transfer

**Parameters**

* Recipient: Address of token recipient
* CollectionId: ID of collection
* ItemId: ID of the item
* Data: Data to be included in the transaction


transferFrom
^^^^^^^^^^^^

**Description**

Change ownership of a NFT on behalf of the owner. See Approve method for additional information. After this method executes, the approval is removed so that the approved address will not be able to transfer this NFT again from this owner.

**Permissions**

* Collection Owner
* Collection Admin
* Current NFT owner
* Address approved by current NFT owner

**Parameters**

* Sender: Address that owns token
* Recipient: Address of token recipient
* CollectionId: ID of collection
* ItemId: ID of the item

transferFromWithData
^^^^^^^^^^^^^^^^^^^^

**Description**

Same as TransferFrom with extra parameter: Data, an array of bytes. Data will be emitted in an event.

**Permissions**

Same as TransferFrom

**Parameters**

* Sender: Address that owns token
* Recipient: Address of token recipient
* CollectionId: ID of collection
* ItemId: ID of the item
* Data: Data to be included in the transaction

approve
^^^^^^^

**Description**

Set, change, or remove approved address to transfer the ownership of the NFT.

**Permissions**

* Collection Owner
* Collection Admin
* Current NFT owner

**Parameters**

* Approved: Address that is approved to transfer this NFT or zero (if needed to remove approval)
* CollectionId: ID of collection
* ItemId: ID of the item

setApprovalForAll (not yet available)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

Sets or unsets the approval of a given address (operator). An operator is allowed to transfer all tokens of the sender on their behalf. Unlike single approvals, approvals granted using this method don’t reset after transfers.

**Permissions**

* Collection Owner
* Collection Admin
* Current NFT owner

**Parameters** 

* CollectionId: ID of the collection
* Approved: True or False


Getting Approvals
^^^^^^^^^^^^^^^^^

The current approvals may be read with `api.query.nft.approvedList`. It returns the list of addresses, approved for the given token.

**Parameters**

* CollectionId: ID of collection
* ItemId: ID of the item

batchTransfer
^^^^^^^^^^^^^

This is an ERC-1155 compatibility method. Not implemented yet

batchApproval
^^^^^^^^^^^^^

This is an ERC-1155 compatibility method. Not implemented yet

batchTransferFrom
^^^^^^^^^^^^^^^^^

This is an ERC-1155 compatibility method. Not implemented yet

safeBatchTransfer
^^^^^^^^^^^^^^^^^

This is an ERC-1155 compatibility method. Not implemented yet

safeBatchTransferFrom
^^^^^^^^^^^^^^^^^^^^^

This is an ERC-1155 compatibility method. Not implemented yet


Data Schema
-----------

setSchemaVersion
^^^^^^^^^^^^^^^^

**Description**

Set schema standard to one of:

* ERC-721 (Image URL only, just like in TestNet 1.0)
* SimpleKV (Simple key-value JSON format)
* OpenSea
* Tezos TZIP-16 (https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-16/tzip-16.md)

**Permissions**

* Collection Owner
* Collection Admin

**Parameters**

* CollectionID: ID of collection
* SchemaVersion: enum

setOffchainSchema
^^^^^^^^^^^^^^^^^

**Description**

Set off-chain data schema. In the initial version of NFT parachain the schema will only reflect image URL. The {id} substring will be parsed to reflect the NFT id.

For example, the schema string for CryptoKitties will look like this::

    https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/{id}.png

Next version of the token data schema is split into three methods: SetOffchainSchema, SetConstOnChainSchema, and SetVariableOnChainSchema, as well as a chain variable: SchemaVersion, which will return the value corresponding to the metadata standard being used. If SchemaVersion is not present in the chain, it means this is still the TestNet 1.0 and there is no on-chain schema yet implemented in it.

The schema must contain the image and page fields, which should use `{id}` placeholder that will be replaced by wallets with the actual token ID in order to get the token page and image URLs. Also, there is an optional “audio” field that contains audio file URL associated with the tokens. The schema will be parsed by 3rd party wallets, but not at the moment of setting the schema.

Example::

    {
      “image”: “https://example.com/images/{id}”,
      “page”: “https://example.com/nft/{id}”,
      “audio”: “https://example.com/audio/{id}”
    }

**Permissions**

* Collection Owner
* Collection Admin

**Parameters**

* CollectionID: ID of collection
* Schema: String representing the offchain data schema



setConstOnChainSchema
^^^^^^^^^^^^^^^^^^^^^

**Description**

Set the on-chain schema (string in JSON-schema format) that describes permanent token fields.

The schema must describe the non-changeable token fields. For each field it must include “size” in bytes and “name”. It will be parsed by 3rd party wallets. At the moment of setting the schema it will only be checked to match constant custom data size. 

Example::

    {
      “field 1” : 10,
      “field 2” : 2,
    }

**Permissions**

* Collection Owner
* Collection Admin

**Parameters**

* CollectionID: ID of collection
* Schema: String representing the offchain data schema

setVariableOnChainSchema
^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

Same as Const on-chain schema, except sets the variable schema. Also, requires name and size of each field and is required to match the total variable data size.

**Permissions**

* Collection Owner
* Collection Admin

**Parameters**

* CollectionID: ID of collection
* Schema: String representing the offchain data schema





Ecomonic Models
---------------

setCollectionSponsor
^^^^^^^^^^^^^^^^^^^^

confirmSponsorship
^^^^^^^^^^^^^^^^^^

removeCollectionSponsor
^^^^^^^^^^^^^^^^^^^^^^^

enableContractSponsoring
^^^^^^^^^^^^^^^^^^^^^^^^

setContractSponsoringRateLimit
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Sponsor Security
^^^^^^^^^^^^^^^^

