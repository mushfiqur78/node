const UAParser = require('ua-parser-js');

const parseDevice = (userAgent = '') => {
  const result = new UAParser(userAgent).getResult();
  return {
    os:      result.os.name      || 'Unknown',
    browser: result.browser.name || 'Unknown',
    device:  result.device.type  || 'desktop',
  };
};

const detectSource = (referer = '', sourceParam = '') => {
  if (sourceParam) return sourceParam;
  if (!referer)    return 'direct';
  if (referer.includes('facebook'))  return 'facebook';
  if (referer.includes('twitter') || referer.includes('x.com')) return 'twitter';
  if (referer.includes('whatsapp'))  return 'whatsapp';
  if (referer.includes('instagram')) return 'instagram';
  if (referer.includes('linkedin'))  return 'linkedin';
  return 'web';
};

module.exports = { parseDevice, detectSource };
