const { Config } = require("./config/config");
const { ProtobufNFT } = require("./lib/proto");
const { Api } = require("./lib/api");



async function* genItems(limit) {
  const items = Array.from({ length: limit }, (_, item) => item + 1);
  for (const item of items) {
    yield { name: `nft token: ${item}` };
  }
}

async function main() {
  try {
    const config = new Config();
    const rtt = require(config.getRuntimeTypes());
    
    // Configuration for connection
    const configApi = {
      endpoint: config.getEndpoint(),
      rtt
    };
    // Configuration for collection
    const configCollection = {
      name: 'test',
      description: 'test',
      tokenPrefix: 'test'
    };
    const schema = config.getSchema();

    const galleryURL = config.getGalleryUrl();
    const owner = config.getOwner();
    const limit = config.getLimit();

    const api = new Api(configApi);

    const protobuff = new ProtobufNFT(schema);
    // initializing the connection
    await api.init();
    // set seed
    api.setSeed(config.getSeed());
    // create collection
    const execut = await api.createCollection(configCollection);
    const collectionId = execut.getCollectionId();
    // set limit on token
    await api.setCollectionLimits(limit);
    // set schema on collection
    await api.setConstOnChainSchema(schema);
    // set image url
    await api.setOffchainSchema(galleryURL);

   for await (const item of genItems(limit)) {     
     const serializeItem = protobuff.serializeNFT(item);     
     const token = {
       buffer: serializeItem,
       owner,
       collectionId
     }
     //mint tokens
     await api.createItem(token);
   }   
  } catch (error) {
    console.log(error);
  }
}

main()
  .then(() => process.exit() )
  .catch((error) => console.error(error));
