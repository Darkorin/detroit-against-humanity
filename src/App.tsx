import { initializeApp } from "firebase/app";

import AppRouter from "./AppRouter";

const firebaseConfig = {
  apiKey: "AIzaSyB87YUmHNWz-5yyfyLGZ2uMHCN2tyVt__8",
  authDomain: "detroit-against-hu.firebaseapp.com",
  databaseURL: "https://detroit-against-hu-default-rtdb.firebaseio.com",
  projectId: "detroit-against-hu",
  storageBucket: "detroit-against-hu.firebasestorage.app",
  messagingSenderId: "1090715319237",
  appId: "1:1090715319237:web:8a50b1483941342c0d69ac"
};

export default () => {
  initializeApp(firebaseConfig);

  return <AppRouter />;
};
