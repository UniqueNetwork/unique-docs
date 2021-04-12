const protobuf = require('protobufjs')

// These "enums" are only used when NFTs are created, not when they are displayed
const Gender = {
    Male: 0,
    Female: 1,
};
const PunkTrait = {
    BLACK_LIPSTICK: 0,
    RED_LIPSTICK: 1,
    SMILE: 2,
    TEETH_SMILE: 3,
    PURPLE_LIPSTICK: 4,
    NOSE_RING: 5,
    ASIAN_EYES: 6,
    SUNGLASSES: 7
};

function serializeNft(payload) {
    let root = protobuf.loadSync("./spunks.proto");
     
    // Obtain the message type
    let NFTMeta = root.lookupType("onchainmetadata.NFTMeta");

    // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
    let errMsg = NFTMeta.verify(payload);
    if (errMsg)
        throw Error(errMsg);
    
    // Create a new message
    let message = NFTMeta.create(payload);
    
    // Encode a message to an Uint8Array (browser) or Buffer (node)
    return NFTMeta.encode(message).finish();
}

function convertEnumToString(value, key, NFTMeta, locale) {
    let result = value;
    try {
        let valueJsonComment = NFTMeta.fields[key].resolvedType.comments[value];
        let translationObject = JSON.parse(valueJsonComment);
        if (translationObject && (translationObject[locale])) {
            let translation = translationObject[locale];
            // console.log(`${object[key][i]} --> ${translation}`);
            result = translation;
        }
    } catch(e) {
        console.log("Error parsing schema when trying to convert enum to string: ", e);
    }
    return result;
}

function deserializeNft(buffer, locale) {
    let root = protobuf.loadSync("./spunks.proto");
     
    // Obtain the message type
    let NFTMeta = root.lookupType("onchainmetadata.NFTMeta");

    // Decode a Uint8Array (browser) or Buffer (node) to a message
    var message = NFTMeta.decode(buffer);
 
    // Maybe convert the message back to a plain object
    var object = NFTMeta.toObject(message, {
        enums: String,  // enums as string names
        longs: String,  // longs as strings (requires long.js)
        bytes: String,  // bytes as base64 encoded strings
        defaults: true, // includes default values
        arrays: true,   // populates empty arrays (repeated fields) even if defaults=false
        objects: true,  // populates empty objects (map fields) even if defaults=false
        oneofs: true
    });

    // TODO: Implement deep traversing of the object 
    // Lookup display name for enums and replace with proper locale translation
    // for (let key in NFTMeta.fields){
    for (let key in object){
        if (NFTMeta.fields[key].resolvedType.constructor.name == "Enum") {
            if (Array.isArray(object[key])) {
                for (let i=0; i<object[key].length; i++) {
                    object[key][i] = convertEnumToString(object[key][i], key, NFTMeta, locale);
                }
            }
            else {
                object[key] = convertEnumToString(object[key], key, NFTMeta, locale);
            }
        }
    }

    return object;
}

// Exemplary payload
let payload = { 
    gender: Gender.Female,
    traits: [PunkTrait.PURPLE_LIPSTICK, PunkTrait.NOSE_RING, PunkTrait.ASIAN_EYES, PunkTrait.SUNGLASSES]
};

let buffer = serializeNft(payload);
console.log("Serialized buffer: ", buffer);

let deserializedObject = deserializeNft(buffer, "ru");
console.log("deserializedObject RUSSIAN: ", deserializedObject);

deserializedObject = deserializeNft(buffer, "en");
console.log("deserializedObject ENGLISH: ", deserializedObject);