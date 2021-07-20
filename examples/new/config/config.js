
class Config {

  // The public node URL depends on the network that you would like to connect
  #endpoint = process.env.WSENDPOINT || 'wss://testnet2.uniquenetwork.io'

  /** 
   * This mnemonic seed can also be used to sign transactions in JavaScript code. 
   * In the examples we use the mnemonic seed for Alice account (seed: “//Alice”), 
   * but you can replace it with your seed to work with TestNet or MainNet
  */
  #seed = process.env.SEED || '//Alice'
  // In the initial version of NFT parachain the schema will only reflect image URL. The {id} substring will be parsed to reflect the NFT id.
  #galleryUrl = process.env.GALLERY_URL || 'https://img.cryptokitties.co/test/{id}.png'

  #collectionId = process.env.COLLECTION_ID || 1;
  //Address, initial owner of the token
  #owner = process.env.OWNER || '';
  //This schema describes the serialization of non-changeable token fields.
  #schema = process.env.SCHEMA || this.#getSchema();

  #runtime_types = process.env.RUNTIME_TYPES || './config/runtime_types.json';

  #limitToken = process.env.LIMIT_TOKEN || 10;
    
  #getSchema() {
    return {
      nested: {
        onchainmetadata: {
          nested: {      
            NFTMeta: {
              fields: {
                name: {
                  id: 1,
                  rule: 'required',
                  type: 'string',
                }
              },
            },
          },
        },
      },
    }
  }

  getEndpoint() {
    return this.#endpoint;
  }

  getSeed() {
    return this.#seed;
  }

  getLimit() {
    return this.#limitToken;
  }

  getGalleryUrl() {
    return this.#galleryUrl;
  }

  getCollectionId() {
    return this.#collectionId;
  }

  getOwner() {
    return this.#owner;
  }

  getSchema() {
    return this.#schema;
  }

  getRuntimeTypes() {
    return this.#runtime_types;
  }
}

module.exports.Config = Config;