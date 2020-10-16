import * as React from 'react'

import { getDisplayName } from '../../utils/react'

import GlobalLoading from './GlobalLoading'

const withGlobalLoading = <T extends object>(Component: React.ComponentType<T>) => {
  const comp = (props: T) => (
    <GlobalLoading>
      <Component {...props} />
    </GlobalLoading>
  )
  comp.displayName = `WithGlobalLoading(${getDisplayName(Component)})`

  return comp
}

export default withGlobalLoading
