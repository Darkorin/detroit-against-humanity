import { FirebaseType } from "../Types/Firebase";

export const STORE_FIREBASE = "STORE_FIREBASE";

export const storeFirebase = (firebase: FirebaseType) => {
  return {
    type: STORE_FIREBASE,
    payload: firebase
  }
}