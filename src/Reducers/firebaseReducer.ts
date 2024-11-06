import { STORE_FIREBASE } from "../Actions/storeFirebase";
import { ActionType } from "../Types/Action";
import { FirebaseType } from "../Types/Firebase";

export const firebaseReducer = (
  state: null | FirebaseType = null,
  action: ActionType
) => {
  if (action.type === STORE_FIREBASE) {
    return action.payload
  }
  return state
}