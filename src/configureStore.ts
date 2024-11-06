import { configureStore } from "@reduxjs/toolkit";
import promise from "redux-promise-middleware";
import rootReducer from "./rootReducer";

const store = configureStore(
  {
    reducer: rootReducer,
    middleware: [promise]
  })

  export { store }