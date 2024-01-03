const crypto = require('node:crypto');

function encrypt(key, value) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv);
  let encrypted = cipher.update(value, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
}

function decrypt(key, value) {
  const [iv, encrypted] = value?.split(':') ?? [];
  if (iv && encrypted) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64'), Buffer.from(iv, 'base64'));
    let plaintext = decipher.update(encrypted, 'base64', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
  }
  return null;
}

module.exports = {
  encrypt,
  decrypt,
};
