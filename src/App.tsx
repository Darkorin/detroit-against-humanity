import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";

import { storeFirebase } from "./Actions/storeFirebase";
import AppRouter from "./AppRouter";
import { storeCms } from "./Actions/storeCms";

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
  const dispatch = useDispatch();
  const firebaseApp = initializeApp(firebaseConfig);

  useEffect(() => {
    const database = getDatabase(firebaseApp);
    dispatch(
      storeFirebase({
        database,
        firebaseApp
      })
    );

    const cmsRef = ref(database, "cms");
    onValue(cmsRef, (snapshot) => {
      if (snapshot.exists()) {
        dispatch(storeCms(snapshot.val()));
      } else {
        console.log("No data available");
      }
    });
  }, []);

  return <AppRouter />;
};
