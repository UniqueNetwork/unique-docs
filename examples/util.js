module.exports.strToUTF16 = (str) => {
    const buf = [];
    for (let i = 0; i < str.length; i++) {
        buf.push(str.charCodeAt(i));
    }
    return buf;
}