import * as React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import ListProjectsPage from './pages/Projects'
import ProjectDetailPage from './pages/ProjectDetails'
import { withGlobalLoading } from './commons/components/GlobalLoading'
import { fetchConfig, fetchJobTypeTemplates, fetchOrgPreference } from './Services/DataServices'
import * as routes from './pages/routes'
import { IAppContext, IConfig } from './commons/types'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useSkedHistory from './commons/hooks/useSkedHistory'

export const AppContext = React.createContext<IAppContext>({
  config: {}
})

const App: React.FC = () => {
  const [appConfig, setAppConfig] = React.useState<IConfig>({})

  const getConfig = React.useCallback(async () => {
    const [
      config,
      jobTypeTemplates,
    ] = await Promise.all([fetchConfig(), fetchJobTypeTemplates()])

    const orgPreference = { enableWorkingHours: true }
    setAppConfig({ ...config, jobTypeTemplates, jobTypeTemplateValues: {}, ...orgPreference })
  }, [])

  React.useEffect(() => {
    getConfig()
  }, [])

  const history = useSkedHistory()
  return (
    <AppContext.Provider value={{ config: appConfig, setAppConfig }}>
      <Router history={history}>
        <Switch>
          <Route exact={true} path={routes.listProjectPath()} component={ListProjectsPage} />
          <Route exact={true} path={routes.projectDetailPath()} component={ProjectDetailPage} />
        </Switch>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        pauseOnHover={true}
        hideProgressBar={true}
      />
    </AppContext.Provider>
  )
}

export default withGlobalLoading(App)
