const crypto = require('crypto');

const generateToken = () => crypto.randomBytes(12).toString('base64url');

module.exports = generateToken;
