########################
Wallet Integration Guide
########################

This document is written for the wallet developers and intends to provide step by step guidance for integrating Unique and Kusama NFTs into the 3rd party wallets.

******
Unique
******

1. User Collections
===================

Step 1 is getting the list of collections, in which user owns tokens. There are two options to get these.

Option 1 - Traversing Events
----------------------------

`This PolkadotJS guide <https://polkadot.js.org/docs/api/examples/promise/system-events>`_ explains how to tranverse events in a substrate based blockchain. 

The events that we are looking for are `Transfer` in `transfer <jsapi.html#transfer>`_ extrinsic. It has parameters: Collection ID+Token ID, sender and recipient, which are the wallet addresses that exchanged NFT, and `ItemCreated` in `createItem (Mint) <jsapi.html#createitem-mint>`_ extrinsic, which contains Collection ID and Recipient (wallet) address.

Option 2 - Manual Input
-----------------------

Sometimes tranversing events may not be the most reliable or quick way to gather the full list of tokens for a user, so the wallet should allow manual user input for the collection by ID or name. In order to prepare for that input, the wallet application can read the full list of collections in the Unique network first. Collection IDs are sequential numbers that start from 1 and go up to the last created collection, which is::

    api.query.nft.createdCollectionCount()
    
Each collection then can be queried with::

    api.query.nft.collection(collectionId)
    
and will contain the Name, Description, and TokenPrefix fields encoded as UTF-16 in response like this::

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
        OffchainSchema: https://example.com/images/{id}.png,
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


2. User Tokens
==============

Once the list of collections that a user (wallet address) has ever dealt with is ready, reading the list of tokens becomes a simple task. This query returns the list of user's tokens in one collection::

    api.query.nft.addressToken(collectionId, address)

The return contains the list of token IDs. Return example::

    [
        5243,
        6323,
        355,
        2888
    ]

3. Token Details
================

Token details allow the wallet to get access to token image and decode its metadata into a human readable format.

There are two types of token details: Common (or similarly structured) for all tokens in the collection, and details that are only relevant for one particular token (like a CryptoKitty name, for example).

Image and Off-chain Metadata
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Even though images and large metadata will be generally stored off-chain (due to cost and efficiency reasons), Unique enables 3rd party wallets to access this data without using any 3rd party APIs. The collection contains the `OffchainSchema` field, which contains the schema string. Even though the collection owners can set an arbitrary string in this field, they are encouraged to use metadata standards in order to be compatible with Unique and 3rd party wallets. Currently there are two schema versions:

* ImageURL
* Unique

ImageURL is very limited. It only allows to set the URL template like "https://example.com/images/{id}.png", which allows replacement of `{id}` placeholder in order to get the image for the token with a particular ID.

Unique schema is much more flexible. It allows not only to encode image URL templates, but also to set the URL for the API that stores token off-chain metadata, and define rules about what token on-chain data bytes mean and how to decode them into a human readable format. The `Data Schema <jsapi.html#data-schema>`_ section describes how to do it. We encourage wallet developers to start implementation with ImageURL schema, then proceed to off-chain part of Unique schema, and finally implement the on-chain part of Unique schema.

On-Chain Token Data
^^^^^^^^^^^^^^^^^^^

Reading token on-chain data is done with a query that depends on the collection type. For NFT tokens, the `nftItemList` state variable should be used. For ReFungible collection it is `reFungibleItemList`. 

For example, this query::

    api.query.nft.nftItemList(collectionId, tokenId)

returns the NFT information:

    {
        Owner: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY,
        ConstData: <TOKEN METADATA>,
        VariableData: <TOKEN USER DATA>
    }

The `ConstData` field contains the token metadata string that cannot be changed and is set when the token is minted. 

The `VariableData` field (which, by the way, is also described by the schema) contains bytes that can be changed by the current owner, and usually will be changed by the application, but the wallet may allow users to change this (as long as the data stays within the schema).



**********
Kusama NFT
**********

TBD
