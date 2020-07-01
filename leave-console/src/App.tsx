import React from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import { withGlobalLoading } from './Components/GlobalLoading'
import {
  routes,
  DashboardPage,
  ResourceDetailPage,
  SettingPage
} from './Pages'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <Router>
        <Route exact path={ routes.dashboard() } component={ SettingPage } />
        <Route path={ routes.resourceDetail() } component={ ResourceDetailPage } />
        <Route path={ routes.settings() } component={ SettingPage } />
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        pauseOnHover={true}
        hideProgressBar={true}
      />
    </>
  )
}

export default withGlobalLoading(App)
