import * as React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import ListProjectsPage from './pages/Projects'
import ProjectDetailPage from './pages/ProjectDetails'
import { withGlobalLoading } from './commons/components/GlobalLoading'
import { fetchConfig } from './Services/DataServices'
import * as routes from './pages/routes'
import { IAppContext } from './commons/types'

export const AppContext = React.createContext<IAppContext>({
  config: {}
})

const App: React.FC = () => {
  const [appConfig, setAppConfig] = React.useState<any>(null)

  const getConfig = React.useCallback(async () => {
    const res = await fetchConfig()
    setAppConfig(res)
  }, [])

  React.useEffect(() => {
    getConfig()
  }, [])

  return (
    <AppContext.Provider value={{ config: appConfig }}>
      <HashRouter>
        <Switch>
          <Route exact={true} path={routes.listProjectPath()} component={ListProjectsPage} />
          <Route exact={true} path={routes.projectDetailPath()} component={ProjectDetailPage} />
        </Switch>
      </HashRouter>
    </AppContext.Provider>
  )
}

export default withGlobalLoading(App)
