const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/api');

/**
 *
 *
 * @class Api
 */
class Api {

  #keyring
  #api
  #seed
  #collectionId

  constructor({endpoint, rtt}) {
    this.#keyring = new Keyring({ type: 'sr25519' });
    
    const wsProvider = new WsProvider(endpoint);
    this.#api = new ApiPromise({ provider: wsProvider, types: rtt });
  
    this.#api.on("disconnected", async (value) => {
      throw Error(value);
    });
  
    this.#api.on("error", async (value) => {      
      throw Error(value);
    });
  }
  
  #stringToBufferUTF16 = (str) => {
    let buf = [];
    for (let i=0, strLen=str.length; i < strLen; i++) {
      buf.push(str.charCodeAt(i));
    }
    return buf;
  }

  #isRequired = (value) => { 
    throw new Error(`${value} -> param is required`) 
  };

  async #submitTransaction(transaction, seed) {
    const getTransactionStatus =  (events, status) => {
      if (status.isReady) {
        return 'NotReady';
      }
      if (status.isBroadcast) {
        return 'NotReady';
      } 
      if (status.isInBlock || status.isFinalized) {
        if(events.filter(e => e.event.data.method === 'ExtrinsicFailed').length > 0) {
          return 'Fail';
        }
        if(events.filter(e => e.event.data.method === 'ExtrinsicSuccess').length > 0) {
          return 'Success';
        }
      }
    
      return 'Fail';
    }
    const sendTransaction = async function(resolve, reject) {
      try {
        await transaction.signAndSend(seed, ({ events, status }) => {
          const transactionStatus = getTransactionStatus(events, status);
          if (transactionStatus === 'Success') {
            resolve(events);
          } else if (transactionStatus === 'Fail') {
            console.log(`Something went wrong with transaction. Status: ${status}`);
            reject(events);
          }
        });
      } catch (error) {
        console.log('Error->', error);
        reject(error);
      }
    };
    return new Promise(sendTransaction);
  };

  async #submitTransactionCollection(transaction, seed) {
    const getCreateCollectionId = (events) => {
      let success = false;
      let collectionId = 0;
      events.forEach(({ phase, event: { data, method, section } }) => {
        // console.log(`    ${phase}: ${section}.${method}:: ${data}`);
        if (method == 'ExtrinsicSuccess') {
          success = true;
        } else if ((section == 'nft') && (method == 'CollectionCreated')) {
          collectionId = parseInt(data[0].toString());
        }
      });
      //this.#collectionId  = collectionId;
      console.log(collectionId);
      return collectionId;
    }

    const sendTransaction = async function(resolve, reject) {
      try {
        const unsub = await transaction
          .signAndSend(seed, (result) => {
            console.log(`Current tx status is ${result.status}`);
        
            if (result.status.isInBlock) {
              console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
            } else if (result.status.isFinalized) {
              console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
              let id = getCreateCollectionId(result.events);
              resolve(id);
              unsub();
            }
        });
      } catch (e) {
        reject(e.toString());
      }
    };
    return new Promise(sendTransaction);
  };

  async #submitTransactionItem(transaction, seed) {
    const sendTransaction = async function(resolve, reject) {
      try {
        const unsub = await transaction
          .signAndSend(seed, (result) => {
            console.log(`Current tx status is ${result.status}`);      
            if (result.status.isInBlock) {
              let success = false;
              let id = 0;
              result.events.forEach(
                ({ phase, event: { data, method, section } }) => {
                  console.log(`${phase}: ${section}.${method}:: ${data}`);
                  if (method == "ItemCreated") {
                    success = true;
                    id = parseInt(data[1].toString());
                  }
                }
              );
    
              if (success) resolve(id);
              else {
                reject(null);
              }
              unsub();
            }
        });
      } catch (e) {
        reject(e.toString());
      }
    }
    return new Promise(sendTransaction);
  };
  
  getConnect() {
    return this.#api;
  }

  setSeed(seed = this.#isRequired('seed to setSeed')) {
    this.#seed = this.#keyring.addFromUri(seed);
    return this;
  }

  getCollectionId() {
    return this.#collectionId;
  }

  setCollectionId(collectionId) {
    this.#collectionId = collectionId;
    return this;
  }

  async init() {
    await this.#api.isReady
    return this;
  }

  async createCollection({
    name = this.#isRequired('name'),    
    description = this.#isRequired('description'),
    tokenPrefix = this.#isRequired('tokenPrefix'),
    modern = { nft: null }
  }) {
    const tx = this.#api.tx.nft.createCollection(
      this.#stringToBufferUTF16(name),
      this.#stringToBufferUTF16(description),
      this.#stringToBufferUTF16(tokenPrefix),
      modern
    )
    this.#collectionId = await this.#submitTransactionCollection(tx, this.#seed);
    return this;
  }

  async setCollectionLimits(limits, id = this.#collectionId) {
    const sourceLimits = ((await this.#api.query.nft.collectionById(id)).toJSON()).Limits;
    const newLimits = { ...sourceLimits, TokenLimit: limits }
    const tx = this.#api.tx.nft.setCollectionLimits(id, newLimits);
    await this.#submitTransaction(tx, this.#seed);
  }

  async setConstOnChainSchema(jsonSchema, id = this.#collectionId) {
    const tx = this.#api.tx.nft.setConstOnChainSchema(id, JSON.stringify(jsonSchema));
    await this.#submitTransaction(tx, this.#seed);
  }

  async setOffchainSchema(galleryUrl, id = this.#collectionId) {    
    const tx = this.#api.tx.nft.setOffchainSchema(id, galleryUrl);    
    await this.#submitTransaction(tx, this.#seed);
  }  
  async createItem({ 
    buffer = this.#isRequired('buffer'), 
    owner = this.#isRequired('owner'), 
    collectionId = this.#isRequired('collectionId') }) {
    const data = {
      NFT: { const_data: Array.from(buffer), variable_data: [] },
    }
    const tx = this.#api.tx.nft.createItem(collectionId, owner, data);
    await this.#submitTransactionItem(tx, this.#seed);
  }
}

module.exports.Api = Api;