import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from './Store'

// App styles and script
import App from './App'
import './index.scss'

const WrappedApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

// Render App
ReactDOM.render(
  <WrappedApp />,
  document.getElementById('root')
)
