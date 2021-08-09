const { mnemonicGenerate, cryptoWaitReady } = require('@polkadot/util-crypto');
const { Keyring } = require('@polkadot/keyring');

cryptoWaitReady().then(() => {
  // generate a random mnemonic, 12 words in length
  const mnemonic = mnemonicGenerate(12);

  // add the account, encrypt the stored JSON with an account-specific password
  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.addFromUri(mnemonic);

  console.log("Random seed phrase: ", mnemonic);
  console.log("Address: ", pair.address);
});

