import { combineReducers } from 'redux'
import { firebaseReducer as firebase } from './Reducers/firebaseReducer';

const appReducer = combineReducers({
  firebase,
});

const rootReducer = (state: any, action: any) => {
  return appReducer(state, action);
}

export default rootReducer;