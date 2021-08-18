const { connect, disconnect, getNftImageUrl, getNftData } = require('./nft-props.js');

const collectionId = 25;
const tokenId = 8802;
const locale = "en";

async function main() {
  await connect();

  // Get token image URL
  const imageUrl = await getNftImageUrl(collectionId, tokenId);
  console.log(`NFT ${collectionId}-${tokenId} Image URL: `, imageUrl);

  // Get token data
  const tokenData = await getNftData(collectionId, tokenId, locale);
  console.log(`NFT ${collectionId}-${tokenId} data: `, tokenData);

  await disconnect();
}

main().catch(console.error).finally(() => process.exit());
