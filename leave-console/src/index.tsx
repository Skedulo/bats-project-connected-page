
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
// App styles and script
import './index.scss'
if (process.env.NODE_ENV === 'production') {
  // @ts-ignore
  import('../assets/fonts/fonts.prod.css')
} else {
  // @ts-ignore
  import('../assets/fonts/fonts.dev.css')
}

import App from './App'
import store from './Store'

// Render App
ReactDOM.render(
  <Provider store={ store }><App /></Provider>
  ,
  document.getElementById('root')
)
