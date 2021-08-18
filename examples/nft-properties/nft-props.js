const { ApiPromise, WsProvider } = require('@polkadot/api');
const { encodeAddress } = require('@polkadot/util-crypto');
const config = require('./config');
const fs = require('fs');
const {deserializeNft} = require('./protobuf.js');
const got = require('got');

let api;

function hexToStr(buf/*: string*/)/*: string*/ {
  let str/*: string*/ = "";
  let hexStart = buf.indexOf("0x");
  if (hexStart < 0) hexStart = 0;
  else hexStart = 2;  
  for (let i=hexStart, strLen=buf.length; i < strLen; i+=2) {
    let ch = buf[i] + buf[i+1];
    let num = parseInt(ch, 16);
    if (num != 0) str += String.fromCharCode(num);
    else break;
  }
  return str;
}

function utf16ToString(uint16_array) {
  let str = "";
  for ( var i=0;i<uint16_array.length;i++ ) 
      str += String.fromCharCode(uint16_array[i]);
  return str;
}

function hexToUTF16(hex) {
  let buf = [];
  let hexStart = hex.indexOf("0x");
  if (hexStart < 0) hexStart = 0;
  else hexStart = 2;  
  for (let i=hexStart, strLen=hex.length; i < strLen; i+=2) {
    let ch = hex[i] + hex[i+1];
    let num = parseInt(ch, 16);
    buf.push(num);
  }
  return buf;
}

async function connect() {
  // Initialise the provider to connect to the node
  const wsProvider = new WsProvider(config.wsEndpoint);
  const rtt = JSON.parse(fs.readFileSync("./runtime_types.json"));

  // Create the API and wait until ready
  api = await ApiPromise.create({ 
    provider: wsProvider,
    types: rtt
  });
}

async function disconnect() {
  api.disconnect();
}

/**
 * Retrieve NFT image URL according to the collection offchain schema
 * 
 * @param collectionId: Id of the collection
 * @param tokenId: Token ID
 * @returns the URL of the token image
 */
async function getNftImageUrl(collectionId, tokenId) {
  if (!api) throw new Error("API is not connected, call connect() first");
  const collection = (await api.query.nft.collectionById(collectionId)).toJSON();
  let url = '';

  // Get schema version and off-chain schema
  const schemaVersion = collection.SchemaVersion;
  const offchainSchema = hexToStr(collection.OffchainSchema);
  if (schemaVersion == "ImageURL") {
    // Replace {id} with token ID
    url = offchainSchema;
    url = url.replace("{id}", `${tokenId}`);
  }
  else {
    // TBD: Query image URL from the RESTful service
  }
  return url;
}

/**
 * Retrieve and deserialize properties
 * 
 * 
 * @param collectionId: Id of the collection
 * @param tokenId: Token ID
 * @param locale: Output locale (default is "en")
 * @returns tokenData: Token data object
 */ 
async function getNftData(collectionId, tokenId, locale = "en") {
  if (!api) throw new Error("API is not connected, call connect() first");
  const collection = (await api.query.nft.collectionById(collectionId)).toJSON();
  const schemaRead = hexToStr(collection.ConstOnChainSchema);
  const token = (await api.query.nft.nftItemList(collectionId, tokenId)).toJSON();
  const nftProps = hexToUTF16(token.ConstData);
  const properties = deserializeNft(schemaRead, nftProps, locale);

  let tokenData = {
    owner: token.Owner,
    prefix: hexToStr(collection.TokenPrefix),
    collectionName: utf16ToString(collection.Name),
    collectionDescription: utf16ToString(collection.Description),
    properties: properties
  };

  return tokenData;
}

/**
 * Retrieve market data from marketplace RESTful interface
 * 
 */
async function getNftMarketData(collectionId, tokenId) {
  const offersResponse = await got(`https://api.unqnft.io/offers?collectionId=${collectionId}&searchText=${tokenId}`);
  const offers = JSON.parse(offersResponse.body);

  let marketData = null;
  if (offers.itemsCount > 0) {
    for (let i=0; i<offers.items.length; i++) {
      if (offers.items[i].tokenId == tokenId) {
        const sellerPublicKey = Buffer.from(offers.items[i].seller, 'base64');
        const sellerAddress = encodeAddress(sellerPublicKey);

        marketData = {
          price: offers.items[i].price,
          quote: 'KSM',
          seller: sellerAddress
        }
      }
    }
  }
  return marketData;
}

module.exports = {
  connect, 
  disconnect,
  getNftImageUrl,
  getNftData,
  getNftMarketData
}