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

Collection Properties
^^^^^^^^^^^^^^^^^^^^^

The following query can be used to get collection state::

    await api.query.nft.collection(collectionId);

which returns an object like the following (for an NFT collection taken as example)::

    {
        Owner: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY,
        Mode: {
            NFT: null
        },
        Access: Normal,
        DecimalPoints: 0,
        Name: [
            110,
            97,
            109,
            101,
            0
        ],
        Description: [
            100,
            101,
            115,
            99,
            114,
            105,
            112,
            116,
            105,
            111,
            110,
            0
        ],
        TokenPrefix: 0x70726566697800,
        MintMode: false,
        OffchainSchema: ,
        SchemaVersion: ImageURL,
        Sponsor: 5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM,
        SponsorConfirmed: false,
        Limits: {
            AccountTokenOwnershipLimit: 10,000,000,
            SponsoredMintSize: 4,294,967,295,
            TokenLimit: 4,294,967,295,
            SponsorTimeout: 14,400
        },
        VariableOnChainSchema: ,
        ConstOnChainSchema: 
    }

**Fields**

    * Owner - Collection owner
    * Mode - type of collection (NFT, Fungible (ERC-20), or ReFungible)
    * Access - Normal (for public access) or WhiteList (for restricted access)
    * DecimalPoints - Number of decimal digits for value (only for Fungible collections)
    * Name - Collection name (up to 64 UTF-16 characters)
    * Description - Collection description (up to 256 UTF-16 characters)
    * TokenPrefix - Token name as displayed in wallets (up to 16 UTF-8 characters)
    * MintMode - True, if anyone is allowed to mint. False otherwise. See `setMintPermission`_
    * SchemaVersion - see `Data Schema`_
    * OffchainSchema - see `Data Schema`_
    * VariableOnChainSchema - see `Data Schema`_
    * ConstOnChainSchema - see `Data Schema`_
    * Sponsor - see `Ecomonic Models`_
    * SponsorConfirmed - see `Ecomonic Models`_
    * Limits - see `setCollectionLimits`_

createCollection
^^^^^^^^^^^^^^^^

**Description**

This method creates a Collection of NFTs. Each Token may have multiple properties encoded as an array of bytes of certain length. The initial owner and admin of the collection are set to the address that signed the transaction. Both addresses can be changed later.

**Permissions**

* Anyone

**Parameters**

* collectionName: UTF-16 string with collection name (limit 64 characters) 
* collectionDescription: UTF-16 string with collection description (limit 256 characters) 
* tokenPrefix: UTF-8 string with token prefix, limit 16 characters
* collectionType:

    * 0 - Invalid (collection does not exist, if type is 0)
    * 1 - NFT. All items in ItemList are unique and indivisible (decimalPoints parameter must be 0). Item IDs are unique, and one item may only be owned by one address.
    * 2 - Fungible. Collection does not have custom data associated with token (custom data size parameter must be 0). All Item IDs are the same and all that is recorded in ItemList in value field is the owner address and owned amount. The value is fixed point decimal with decimalPoints set as in the parameter to this method.
    * 3 - Re-Fungible. Custom data is allowed, but Items IDs are not unique. One item may be owned by more than one address. Value in ItemList entry corresponds to the owned portion of token. Value is an integer number and corresponds to the number of owned pieces.
* decimalPoints: Decimal points to be used in token amounts. If set to 0, tokens are indivisible.

**Events**

* CollectionCreated

    * CollectionID: Globally unique identifier of newly created collection.
    * Owner: Collection owner



**Code example**:

::

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

setVariableMetaData
^^^^^^^^^^^

**Description**

Update token custom data (the changeable part).

**Permissions**

* Collection Owner
* Collection Admin
* Current NFT Owner

**Parameters**

* CollectionID: ID of the collection
* ItemID: ID of NFT to set metadata for


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

Sets some collection limits and starts enforcing them immediately (with no exception for collection owner or admins). By default the collection limits are not set, so for example, the number of items that an addres can own is not limited. When the limits are set, the current number of owned items will be checked, and if it already exceeds the limit, the transaction will fail. After the limits are set, they start being enforced.

Note that some bounds are also set by the global chain limits (see `setChainLimits`). The more restrictive limits will always apply. 

    * `AccountTokenOwnershipLimit` - Maximum number of tokens that one address can own. Default value is not limited, maximum value is 10,000,000. When the number of tokens owned by a single address reaches this number, no more tokens can be transferred or minted to this address.
    * `SponsoredMintSize` - maximum byte size of custom NFT data that can be sponsored when tokens are minted in sponsored mode. If the amount of custom data is greater than this parameter when tokens are minted, then the transaction sender will pay transaction fees when minting tokens.
    * `TokenLimit`  - total amount of tokens that can be minted in this collection. Default value is unlimited. If the value is not set (equals to default), the number of tokens is not limited until this limit is set. When the limit is set, the NFT pallet will check if the number of minted tokens is less or equal than the parameter value. If the number of minted tokens is greater than this number, the transaction will fail. This limit is designed to feacilitate token scarcity. So, it can only be set to a lower value than previous (or if previous value is default).
    * `SponsorTimeout` - Time interval in blocks that defines once per how long a non-privileged user transaction can be sponsored. Default value is 14400 (24 hrs), allowed values are from 0 (not limited) to 10,368,000 (1 month). 
    * `OwnerCanTransfer` - Boolean value that tells if collection owner or admins can transfer or burn tokens owned by other non-privileged users. This is a one-way switch: If it is ever disabled (set to `false`), it cannot be re-enabled (set back to `true`).
    * `OwnerCanDestroy` - Boolean value that tells if collection owner can destroy it. This is a one-way switch: If it is ever disabled (set to `false`), it cannot be re-enabled (set back to `true`).

**Permissions**

* Collection Owner

**Parameters**

* collectionId: ID of the collection to set limits for
* CollectionLimits structure (see the description of fields above)



Token Management
---------------------

createItem (Mint)
^^^^^^^^^^^^^^^^^

**Description**

This method creates a concrete instance of NFT, Fungible, or ReFungible Collection created with `createCollection`_ method.

**Permissions**

* Collection Owner
* Collection Admin
* Anyone, if 

    * White List is enabled, and
    * Address is added to white list, and
    * MintPermission is enabled (see setMintPermission method)

**Parameters**

* CollectionID: ID of the collection
* Owner: Address, initial owner of the token
* Properties: Depends on collection type

  * NFT: Arrays of bytes that contain NFT properties. Since NFT Module is agnostic of properties’ meaning, it is treated purely as an array of bytes.

    * const_data: Immutable properties
    * variable_data: Mutable properties
  * Fungible: Amount to create (multiplied by 10 to the decimalPoints power. E.g. if decimalPoints equals 2, number 301 creates 3.01 tokens)
  * ReFungible:

    * const_data: Immutable properties
    * variable_data: Mutable properties
    * pieces: Number of pieces this token is divided into

**Events**

* ItemCreated
    * CollectionID: ID of collection
    * ItemId: Depends on the collection type:
    
      * NFT: Identifier of newly created NFT. which is unique within the Collection, so the NFT is uniquely identified with a pair of values: CollectionId and ItemId.
      * Fungible: Item IDs are not used, so the value is just 0
      * ReFungible: Same as NFT
    * Recipient: Address that receives token

createMultipleItems
^^^^^^^^^^^^^^^^^^^

**Description**

This method creates multiple instances of NFT, Fungible, or ReFungible Collection created with `createCollection`_ method.

**Permissions**

* Collection Owner
* Collection Admin
* Anyone, if 

    * White List is enabled, and
    * Address is added to white list, and
    * MintPermission is enabled (see setMintPermission method)

**Parameters**

* CollectionID: ID of the collection
* Owner: Address, initial owner of all tokens created in this transaction
* Items: Array of items to create. Each single item is described by properties as in `createItem`_ method

**Events**

One `ItemCreated` event is emitted for each created token

* ItemCreated
    * CollectionID: ID of collection
    * ItemId: Depends on the collection type:
    
      * NFT: Identifier of newly created NFT. which is unique within the Collection, so the NFT is uniquely identified with a pair of values: CollectionId and ItemId.
      * Fungible: Item IDs are not used, so the value is just 0
      * ReFungible: Same as NFT


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

    * Non-Fungible Mode: Required
    * Fungible Mode: Ignored
    * Re-Fungible Mode: Required
* Value: Amount to burn

    * Non-Fungible Mode: Ignored (only the whole token can be burned)
    * Fungible Mode: Must specify transferred amount
    * Re-Fungible Mode: Ignored (the owned portion is burned completely)


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

**Events**

* Transfer
    
    * Collection ID + Token ID - packed in u64. The 0xFFFFFFFF00000000 mask identifies collection ID, 0x00000000FFFFFFFF mask yields token ID
    * Sender
    * Recipient 
    * Amount (always 1 for NFT)

transferWithData (not yet available)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

This ERC-721 compatibility method is not yet implemented. 

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

transferFromWithData (not yet available)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

This ERC-721 compatibility method is not yet implemented. 

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

Set, change, or remove approved address to transfer the ownership of the token. The Amount value must be between 0 and owned amount or 1 for NFT.

**Permissions**

* Collection Owner
* Collection Admin
* Current NFT owner

**Parameters**

* Spender: Address that is approved to transfer this token
* CollectionId: ID of collection
* ItemId: ID of the item
* Amount: 

    * Non-Fungible Mode: Required, must be 1 (for approval) or 0 (for disapproval). 
    * Fungible Mode: Required, amount to add to approved amounts for the Spender or 0 (to remove approvals)
    * Re-Fungible Mode: Required, amount to add to approved amounts for the Spender or 0 (to remove approvals)

setApprovalForAll (not yet available)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

This ERC-721 compatibility method is not yet implemented. 

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

* ImageURL (Image URL only, just like in TestNet 1.0)
* Unique
* OpenSea
* Tezos TZIP-16 (https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-16/tzip-16.md)

The data schema is used by NFT wallets in order to display the token metadata, as well as offchain token data (such as images, etc.) correctly in the wallet. `Unique Wallet <https://uniqueapps.usetech.com/#/nft>`_ currently supports `ImageURL` and `Unique` formats.

**Image URL**

This schema format assumes saving the image URL template in `constOnChainSchema`. The image template allows NFT wallets to reconstruct the full image URL for each token using its ID. The URL template can contain {id} placeholder that will be replaced with the actual token ID when the image URL is reconstructed.

Example::

    https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/images/punks/image{id}.png

**Unique**

The `Unique` format allows NFT wallets to decode on-chain token metadata and access off-chain data. This format is currently evolving and may update in the future. It supports three schemas: constant on-chain, variable on-chain, and off-chain. The schema is the JSON string that contains information about how to access and decode token metadata.

In case of on-chain metadata, the data is binary (i.e. an array of bytes), so the schema shows how to convert that binary on-chain data into human readable entries. Schema object contains the mapping of entries. Each entry is a JSON object. It has the name key (e.g. "Trait 1" in the example below), and properties: type, byte size, and optional list of values. Type can be one of "enum", "number", or "string". In case of `enum` type, `values` contain the string value for each ordinary integer value of enum. For example, if the byte referred by "Trait 1" equals 0x01, the value displayed in the NFT wallet for it will be "Red Lipstick".

In case of off-chain metadata, the data is accessed at a 3rd party or an IPFS URL. URLs may contain the {id} placeholder that will be replaced by the wallet in order to reconstruct the URL for that resource. Currently the Unique Wallet only supports "metadata" entry (just like in the example below). The JSON object returned by the metadata endpoint must contain "image" key with image URL value.

Example for const or variable on-chain::

    {
        {"Trait 1": 
            {
                "type": "enum",
                "size": 1,
                "values": ["Black Lipstick","Red Lipstick","Smile","Teeth Smile","Purple Lipstick","Nose Ring","Asian Eyes","Sun Glasses","Red Glasses","Round Eyes","Left Earring","Right Earring","Two Earrings","Brown Beard","Mustache-Beard","Mustache","Regular Beard","Up Hair","Down Hair","Mahawk","Red Mahawk","Orange Hair","Bubble Hair","Emo Hair","Thin Hair","Bald","Blonde Hair","Caret Hair","Pony Tails","Cigar","Pipe"]
            }
        }
    }

Example for off-chain schema::

    {
        "metadata": "https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/metadata/token{id}"
    }

Example of data returned from metadata endpoint for token ID 1::

    {
        "image" : "https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/images/punks/image1.png"
    }


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

Getting Data Schemas
^^^^^^^^^^^^^^^^^^^^

In order to get a data schema for the collection, one should use following query: `api.query.nft.collection`. The response to the query is the JSON object that contains schemas information in fields `OffchainSchema`, `VariableOnChainSchema`, and `ConstOnChainSchema`:

    {
      Owner: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY,
      Mode: {
        NFT: null
      },
      Access: Normal,
      DecimalPoints: 0,
      Name: [
        0
      ],
      Description: [
        0
      ],
      TokenPrefix: 0x3000,
      MintMode: false,
      OffchainSchema: "",
      Sponsor: 5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM,
      SponsorConfirmed: false,
      VariableOnChainSchema: "",
      ConstOnChainSchema: ""
    }

**Parameters**

* CollectionID: Id of collection 

**Code Example**

::

    await api.query.nft.collection(collectionId);

Ecomonic Models
---------------

The Unique Network allows sponsoring user transactions for NFT collections and smart contracts. When collection (or smart contract) is sponsored, all their users need is to have the Unique wallet and address, but they don't need to have any Unique balance on the wallet. This feature removes the extra friction for the end user and creates nice flawless user expeirence.

setCollectionSponsor
^^^^^^^^^^^^^^^^^^^^

**Description**

Setting collection sponsor is the 2-step process. This method is the step 1: Set the sponsor address. The sponsor will need to confirm the sponsorship using `confirmSponsorship` method before the sponsoring begins.

**Permissions**

* Collection Owner

**Parameters**

* CollectionID: ID of collection
* Sponsor: Sponsor address


confirmSponsorship
^^^^^^^^^^^^^^^^^^

**Description**

Setting collection sponsor is the 2-step process. This method is the step 2: Confirm sponsorship. The sponsor needs to confirm the sponsorship so that the collection owners cannot atack the addresses they are not related with.

**Permissions**

* Collection Sponsor

**Parameters**

* CollectionID: ID of collection


removeCollectionSponsor
^^^^^^^^^^^^^^^^^^^^^^^

**Description**

Disable sponsoring and switch back to pay-per-own-transaction model.

**Permissions**

* Collection owner

**Parameters**

* CollectionID: ID of collection

enableContractSponsoring
^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

Enable the smart contract to pay for its own transaction using its endowment. Can only be called by the contract owner, i.e. address that deployed this smart contract. The sponsoring will only start working after the rate limit is set with `setContractSponsoringRateLimit`_.

**Permissions**

* Address that deployed smart contract

**Parameters**

* contractAddress: Address of the contract to sponsor
* enable: Boolean flag to enable or disable smart contact self-sponsoring


setContractSponsoringRateLimit
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

Set the rate limit for contract sponsoring. If not set (has the default value of 0 blocks), the sponsoring will be disabled. If set to the number B (for blocks), the transactions will be sponsored with a rate limit of B, i.e. fees for every transaction sent to this smart contract will be paid from contract endowment if there are at least B blocks between such transactions. Nonetheless, if transactions are sent more frequently, the fees are paid by the sender.

**Permissions**

* Address that deployed smart contract

**Parameters**

* contractAddress: Address of the contract to sponsor
* rate_limit: Number of blocks to wait until the next sponsored transaction is allowed


Sponsor Security
^^^^^^^^^^^^^^^^

Sponsoring smart contracts is tricky. Users can generate addresses very quickly because creating an address is as simple as generating a random 64-byte sequence. So, it is really hard to prevent someone from making very many smart contract calls if they are sponsored. But the sponsor funds need to be protected.

One way to protect funds is to introduce severe rate limits globally, i.e. for all users of the smart contract, but it also degrades the user experience, especially if there are malicious players who race for free contract calls.

The `setContractSponsoringRateLimit` only limits the call rate for each address, so it is designed to be used with White Lists, enabled by `toggleContractWhiteList`_, when the number of addresses is limited.

So the quick recipe for secure smart contract sponsoring is::

    RATE LIMIT + WHITE LIST

The contract owner (address that deployed it) can add user addresses to the white lists using `addToContractWhiteList`_ method. For a dApp this can be combined with user registration, when the account is confirmed (or captcha or KYC is passed, for example).


toggleContractWhiteList
^^^^^^^^^^^^^^^^^^^^^^^

**Description**

Enable the white list for a contract. If enabled, only addresses added to the white list with `addToContractWhiteList`_ (as well as the contract owner) will be able to call this smart contract. If disabled, all addresses can call this smart contract.

**Permissions**

* Address that deployed smart contract

**Parameters**

* contractAddress: Address of the contract
* enable: Boolean that tells to either enable (if true) or disable (if false) the white list for that smart contract

addToContractWhiteList
^^^^^^^^^^^^^^^^^^^^^^

**Description**

Add an address to smart contract white list.

**Permissions**

* Address that deployed smart contract

**Parameters**

* contractAddress: Address of the contract
* Address to add


removeFromContractWhiteList
^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Description**

Remove an address from smart contract white list.

**Permissions**

* Address that deployed smart contract

**Parameters**

* contractAddress: Address of the contract
* Address to remove


Governance-only Methods
-----------------------

The methods in this group can only be called by the root of the chain. They are not available for public use and are only listed for reference.

setChainLimits
^^^^^^^^^^^^^^

**Description**

Sets some chain limits and starts enforcing them immediately. 

    * `collection_numbers_limit`: Total number of collections
    * `account_token_ownership_limit`: Total number of tokens that a single address can own
    * `collections_admins_limit`: Total number of collection admins
    * `custom_data_limit`: The maximum byte-size of token metadata
    * `nft_sponsor_timeout`: The number of blocks between sponsored transfers for NFT tokens
    * `fungible_sponsor_timeout`: The number of blocks between sponsored transfers for Fungible tokens
    * `refungible_sponsor_timeout`: The number of blocks between sponsored transfers for Refungible tokens

**Permissions**

* Network Root

**Parameters**

* ChainLimits structure (see the description of parameters above)

