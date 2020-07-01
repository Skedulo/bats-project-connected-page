import React from 'react'

import { classes } from '../../common/utils/classes'

const bem = classes('absenceTable')

export const EmptyResults: React.FC = () => {
  return (
    <div
      className={ bem('emptyResults') }
      style={ {
        gridRowStart: 2,
        gridRowEnd: 3,
        gridColumnStart: 1,
        gridColumnEnd: -1
      } }
    >
      There are no unavailable resources in the selected period
    </div>
  )
}
