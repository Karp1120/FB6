const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'cache.json');
const TTL = 60000; 

function isCacheValid() {
  if (!fs.existsSync(CACHE_FILE)) return false;
  const { timestamp } = JSON.parse(fs.readFileSync(CACHE_FILE));
  return Date.now() - timestamp < TTL;
}

function getCache() {
  const { data } = JSON.parse(fs.readFileSync(CACHE_FILE));
  return data;
}

function saveCache(data) {
  const payload = {
    timestamp: Date.now(),
    data
  };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2));
}

module.exports = {
  isCacheValid,
  getCache,
  saveCache
};
