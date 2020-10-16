import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { Router, Route, Switch, Redirect } from 'react-router-dom'

import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { withGlobalLoading, LoadingTrigger } from './commons/components/GlobalLoading'

import Page403 from './pages/403'
import Teams from './pages/Teams'

import { updateConfig, startLoading, endLoading } from './Store/action'
import useSkedHistory from './commons/hooks/useSkedHistory'

import { State } from './commons/types'
import { fetchConfig } from './Services/DataServices'

import 'react-toastify/dist/ReactToastify.css'

const App: React.FC = () => {
  const history = useSkedHistory()
  const dispatch = useDispatch()
  const loading = useSelector<State>(state => state.loading)

  const getConfig = useCallback(async () => {
    dispatch(startLoading())
    const config = await fetchConfig()
    dispatch(updateConfig(config))
    dispatch(endLoading())
  }, [])

  useEffect(() => {
    getConfig()
  }, [])

  return (
    <Router history={history}>
      <div className="cx-bg-white">
        {loading && <LoadingTrigger />}
        <Teams />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        pauseOnHover={true}
        hideProgressBar={true}
      />
    </Router>
  )
}

export default withGlobalLoading(App)
