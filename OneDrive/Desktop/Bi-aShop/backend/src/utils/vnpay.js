const crypto = require('crypto');

function sortObjectByKey(object = {}) {
  const sorted = {};
  Object.keys(object)
    .sort()
    .forEach((key) => {
      const encodedValue = encodeURIComponent(String(object[key])).replace(/%20/g, '+');
      sorted[key] = encodedValue;
    });
  return sorted;
}

function toQueryString(object = {}) {
  return Object.keys(object)
    .map((key) => `${key}=${object[key]}`)
    .join('&');
}

function getVietnamDateString(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const vietnamTime = new Date(utc + 7 * 60 * 60000);

  const year = vietnamTime.getFullYear();
  const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getDate()).padStart(2, '0');
  const hours = String(vietnamTime.getHours()).padStart(2, '0');
  const minutes = String(vietnamTime.getMinutes()).padStart(2, '0');
  const seconds = String(vietnamTime.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = String(forwarded).split(',')[0].trim();
    return normalizeIp(ip);
  }

  return normalizeIp(req.ip || req.connection?.remoteAddress || '127.0.0.1');
}

function normalizeIp(ip) {
  const normalized = String(ip || '').trim();

  if (!normalized || normalized === '::1') {
    return '127.0.0.1';
  }

  if (normalized.startsWith('::ffff:')) {
    return normalized.replace('::ffff:', '');
  }

  return normalized;
}

function buildVnpayUrl({ params, vnpayUrl, hashSecret }) {
  const sorted = sortObjectByKey(params);
  const signData = toQueryString(sorted);
  const secureHash = crypto.createHmac('sha512', hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');

  return `${vnpayUrl}?${signData}&vnp_SecureHashType=SHA512&vnp_SecureHash=${secureHash}`;
}

function verifyVnpaySignature(query, hashSecret) {
  const secureHash = query.vnp_SecureHash;
  if (!secureHash) {
    return false;
  }

  const queryData = { ...query };
  delete queryData.vnp_SecureHash;
  delete queryData.vnp_SecureHashType;

  const sorted = sortObjectByKey(queryData);
  const signData = toQueryString(sorted);
  const expectedHash = crypto
    .createHmac('sha512', hashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  return secureHash === expectedHash;
}

module.exports = {
  getVietnamDateString,
  addMinutes,
  getClientIp,
  buildVnpayUrl,
  verifyVnpaySignature,
};
