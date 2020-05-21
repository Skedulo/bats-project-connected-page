import * as React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { withGlobalLoading } from './commons/components/GlobalLoading'
import ListProjectsPage from './pages/Projects'
import ProjectDetailPage from './pages/ProjectDetails'
import * as routes from './pages/routes'

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact={true} path={routes.listProjectPath()} component={ListProjectsPage} />
        <Route exact={true} path={routes.projectDetailPath()} component={ProjectDetailPage} />
      </Switch>
    </Router>
  )
}

export default withGlobalLoading(App)
