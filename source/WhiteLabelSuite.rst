White Lable Suite 
===============

Welcome to the White Lable Suite
-----------------

Welcome to Unique.network White Label Suite. Here you will find all the information and repositories you will need to build a proof of concept (POC) NFT marketplace. 

For an overview check out the 'unique network tech paper <https://github.com/UniqueNetwork/unique_techpaper>'_

For developers start at 'unique-network <https://unique-network.readthedocs.io/en/latest/overview.html>_ 

To see the features and capabilities of unique network explore the 'whitelabel.market <https://whitelabel.market/>_

and our our growing ecosystem of unique network NFT Market places 
'unqnft.io <https://unqnft.io/'
'Vernissage.art <http://vernissage.art>'

For creating accounts and getting TestNet Unique tokens see 'Getting Started <https://unique-network.readthedocs.io/en/latest/gettingstarted.html#>'_

This is where you can find the code to build a POC NFT marketplace. 

Bootstrap: https://github.com/UniqueNetwork/marketplace_docker
Service layer API: https://github.com/UniqueNetwork/marketplace_backend
Minting backend: https://github.com/UniqueNetwork/unique-gallery
Frontend: https://github.com/UniqueNetwork/unique-marketplace

Quick start
=============

git clone https://github.com/UniqueNetwork/marketplace_docker

cd/marketplace_docker 

git submodule update --init --recursive --remote

cd /marketplace_docker/ui

git branch 

Now you are ready to create your User Interface

Next set the environment (.env) file with the address and seed phrase created when 'Getting Started <https://unique-network.readthedocs.io/en/latest/gettingstarted.html#>'

here:  https://github.com/UniqueNetwork/marketplace_docker/blob/master/.env.sample 

Insert image - Alice 

MarketplaceuniqueAddress = The address you created
ADMIN_SEED = The seed of the MarketplaceuniqueAddress 
MINT_COLLECTION_ID = the collection identifier 


WARNING: This is for proof of concept, this mechanism is unsuitable for production environments

Next is to take the 'Matcher contract <https://ipfs.io/ipfs/QmX7WCb9s96Aev3sES9eBg3wLCBSqKYCYHQZhtP1fF51jJ?filename=matcher.wasm>'  and its 'JSON metadata <https://ipfs.io/ipfs/QmRQFH57u5bZR9HP6ndkbH9NYDqk9takKYUAHb46UTVcds?filename=metadata.json>'

To the 'Polkadot.js.org/apps <https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftestnet2.uniquenetwork.io#/contracts>

(This will need to be signed by the MarketplaceuniqueAddress used to set the .env file)

- Click on "Upload and Deploy code"
- Select the MarketplaceUniqueAddress (needs to be imported in your Polkadot{.js} wallet)
- Drag and drop JSON and WASM contract files 
- Click Next
- Put the endowment of 10,000 Unique (for Mainnet it will be lower)
- Click deploy
- Go to the contract and find the method "setAdmin"
- Set the admin to MarketplaceUniqueAddress address so it is both owner and admin of the contract

To create a collection for minting NFTs 
This can be found in the 'gallery_backend <https://github.com/UniqueNetwork/unique-gallery-api>' repository  

- edit 'create_collection.js <https://github.com/UniqueNetwork/unique-gallery-api/blob/e1cd938fe971628ba7f4c960d09f2d4aceb3e3a2/src/create_collection.js#L52> file 


- Set collection name, description, and token prefix #L52 'here <https://github.com/UniqueNetwork/unique-gallery-api/blob/e1cd938fe971628ba7f4c960d09f2d4aceb3e3a2/src/create_collection.js#L52>'
- Replace "whitelabel.market" with the gallery URL #L88

- Set the ADMIN_SEED (instead of "//Alice") in the 'config.js <https://ipfs.io/ipfs/QmUj91enBVyq1eJkqkwmaYnoGSgRd4sYUrvbMiZz4iA45C?filename=changemyname.config.js>' file and copy this file to the src folder.
save config.js file and copy this file to the src folder.

- Run the script: `node create_collection.js`
