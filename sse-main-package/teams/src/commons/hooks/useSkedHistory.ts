import { createMemoryHistory } from 'history'
import * as React from 'react'

import isString from 'lodash/fp/isString'

import { navigation, routes } from '../../Services/Services'

const resolveRoute = (newRoutes: string | string[]) => {
  if (isString(newRoutes)) {
    return `/${newRoutes}`
  }
  return `/${newRoutes.filter(val => !!val).join('/')}`
}
const useSkedHistory = () => {
  const history = React.useMemo(
    () =>
      createMemoryHistory({
        initialEntries: [resolveRoute(routes)], // The initial URLs in the history stack
        initialIndex: 0 // The starting index in the history stack
      }),
    []
  )
  React.useEffect(() => {
    const unlisten = history.listen(({ pathname }) => {
      navigation.setParentRoute(pathname.substr(1))
    })
    navigation.registerRouteHandler(({ routes: newRoutes }) => {
      history.push(resolveRoute(newRoutes))
    })

    return () => {
      unlisten()
    }
  }, [])
  return history
}

export default useSkedHistory
