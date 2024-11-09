export const environment = {
  // Chứa biến môi trường ở local
  production: true,
  // 1. Development
  // baseUrl: 'http://localhost:4040',
  // 2. Production
  baseUrl: 'https://unicourse-server-latest.onrender.com',
  // 3. Pre-production
  // baseUrl: 'https://unicourse-server-test-latest.onrender.com',

  // Socket.IO URL
  // 1. Development
  // socketURL: 'http://localhost:4040',
  // 2. Production
  socketURL: 'https://unicourse-server-latest.onrender.com',
  // 3. Pre-production
  // socketURL: 'https://unicourse-server-test-latest.onrender.com',

  // Logo
  LOGO: './assets/logo/unicourse-logo.webp',

  // 3. Firebase
  firebase_config: {
    apiKey: 'AIzaSyCrH3nRPoIYgBtcCMdFwtu4IgayGz5EXps',
    authDomain: 'unicourse-f4020.firebaseapp.com',
    projectId: 'unicourse-f4020',
    storageBucket: 'unicourse-f4020.appspot.com',
    messagingSenderId: '571256265329',
    appId: '1:571256265329:web:1390beeaed0b4e767819d0',
  },

  // 4. Vimeo API
  vimeoKey: 'Unicourse@04102024'
};
