import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { Router } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { isEmpty } from 'lodash'

import { withGlobalLoading, useGlobalLoading } from './commons/components/GlobalLoading'
import { updateConfig, updateSwimlaneSetting } from './Store/action'
import useSkedHistory from './commons/hooks/useSkedHistory'
import { STORAGE_KEY } from './commons/constants'
import { getLocalStorage } from './commons/utils'
import { fetchConfig } from './Services/DataServices'
import { Config, State } from './commons/types'

import Teams from './pages/Teams'

import 'react-toastify/dist/ReactToastify.css'

const App: React.FC = () => {
  const history = useSkedHistory()
  const dispatch = useDispatch()
  const config = useSelector<State, Config>(state => state.config)
  const { startGlobalLoading, endGlobalLoading } = useGlobalLoading()
  const getConfig = useCallback(async () => {
    startGlobalLoading()
    const config = await fetchConfig()
    const storedSwimlaneSetting = getLocalStorage(STORAGE_KEY.TEAM_SWIMLANE_SETTING)
    dispatch(updateConfig(config))
    if (storedSwimlaneSetting) {
      dispatch(updateSwimlaneSetting(JSON.parse(storedSwimlaneSetting)))
    }
    endGlobalLoading()
  }, [])

  useEffect(() => {
    getConfig()
  }, [])

  return (
    <Router history={history}>
      <div className="cx-bg-white">
        {!isEmpty(config) && <Teams />}
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
