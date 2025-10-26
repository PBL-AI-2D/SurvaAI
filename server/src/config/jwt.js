export default {
  accessSecret: process.env.JWT_ACCESS_SECRET || '/M6sUwjgkAVvnF/t/wHasWk/FO3xCE7vLWjuXZHHQt4=',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'oQvR6geBPYDn+LnByGC6K+xne4nDbKw3peQ2SBknzgo=',
  accessExpires: '15m',
  refreshExpires: '30d',
  algorithm: 'HS256',
};
