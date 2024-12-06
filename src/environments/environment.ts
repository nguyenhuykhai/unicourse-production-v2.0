export const environment = {
  // Chứa biến môi trường ở local
  production: true,
  // 1. Production
  baseUrl: process.env['BASE_URL'],

  // Socket.IO URL
  // 1. Production
  socketURL: process.env['SOCKET_URL'],

  // Logo
  LOGO: './assets/logo/unicourse-logo.webp',

  // 3. Firebase
  firebase_config: {
    apiKey: process.env['FIREBASE_API_KEY'],
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
    projectId: process.env['FIREBASE_PROJECTID'],
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDERID'],
    appId: process.env['FIREBASE_APPID'],
  },

  // 4. Vimeo API
  vimeoKey: process.env['VIMEO_KEY']
};