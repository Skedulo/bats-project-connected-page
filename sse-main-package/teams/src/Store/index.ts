import { createStore, compose } from 'redux'

import reducer from './reducer'

// @ts-ignore
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose || compose;

const store = createStore(
  reducer,
  composeEnhancers && composeEnhancers(),
)

export default store
