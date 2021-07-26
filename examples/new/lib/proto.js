const protobuf = require('protobufjs');

class ProtobufNFT {

  #rootLookup  = 'onchainmetadata.NFTMeta';
  #schema = '';

  constructor(schema) {
    this.#schema = schema;
  }
  
  #getDefineMessage = () => protobuf.Root.fromJSON(this.#schema);

  #convertEnumToString = (value, key, NFTMeta, locale) => {
    let result = value;

    try {
      const options = NFTMeta?.fields[key]?.resolvedType?.options[value];
      const translationObject = JSON.parse(options);
  
      if (translationObject && (translationObject[locale])) {
        result = translationObject[locale];
      }
    } catch (e) {
      console.log('Error parsing schema when trying to convert enum to string: ', e);
    }
  
    return result;
  };

  setSchema(schema) {
    this.#schema = schema;
  }
  
  getSchema() {
    return this.#schema;
  }

  serializeNFT(payload) {
    const root = this.#getDefineMessage();
    const NFTMeta = root.lookupType(this.#rootLookup);
    // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
    const errMsg = NFTMeta.verify(payload);
    if (errMsg) {
      throw Error(errMsg);
    }
    // Create a new message
    const message = NFTMeta.create(payload);
    // Encode a message to an Uint8Array (browser) or Buffer (node)
    return NFTMeta.encode(message).finish();
  }

  deserializeNFT({buffer, locale}) {
    const root = this.#getDefineMessage();
    const NFTMeta = root.lookupType(this.#rootLookup);
    const message = NFTMeta.decode(buffer);
    const originalObject = NFTMeta.toObject(message);
    const parseObject = NFTMeta.toObject(message, {
      enums: String, // enums as string names
      longs: String, // longs as strings (requires long.js)
      bytes: Array, // bytes as base64 encoded strings
      defaults: true, // includes default values
      arrays: true, // populates empty arrays (repeated fields) even if defaults=false
      objects: true, // populates empty objects (map fields) even if defaults=false
      oneofs: true,
    });

    const mappingObject = Object.fromEntries(Object.keys(originalObject).map((key) => [key, parseObject[key]]));

    for (const key in mappingObject) {
      if (NFTMeta.fields[key].resolvedType === null) {
        continue;
      }
      if (NFTMeta.fields[key].resolvedType.constructor.name == 'Enum') {
        if (Array.isArray(mappingObject[key])) {
          const items = mappingObject[key];
          items.forEach((item, index) => {
            mappingObject[key][index] = this.#convertEnumToString(
              mappingObject[key][index],
              key,
              NFTMeta,
              locale,
            );
          })
        } else {
          mappingObject[key] = this.#convertEnumToString(
            mappingObject[key],
            key,
            NFTMeta,
            locale,
          );
        }
      }
    }
    return mappingObject;
  }  
}

module.exports.ProtobufNFT = ProtobufNFT;