import * as React from 'react'
import GlobalLoading from './GlobalLoading'

const withGlobalLoading = <T extends object>(Component: React.ComponentType<T>): React.FC<T> => {
  return props => (
    <GlobalLoading>
      <Component {...props} />
    </GlobalLoading>
  )
}

export default withGlobalLoading
