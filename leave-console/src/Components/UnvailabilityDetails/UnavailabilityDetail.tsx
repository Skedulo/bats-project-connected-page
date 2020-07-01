import React from 'react'

import { classes } from '../../common/utils/classes'
import { Icon, IconNames } from '@skedulo/sked-ui'

import './UnavailabilityDetail.scss'

const bem = classes('unavailability-detail')

interface UnavailabilityDetailProps {
  iconName: IconNames,
  title: string,
  value: string,
}

const UnavailabilityDetail: React.FC<UnavailabilityDetailProps> = ({ iconName, title, value }) => (
  <div className={ bem() }>
    <Icon className={ bem('icon') } name={ iconName } size={ 20 } />
    <div>
      <h2 className={ bem('title') }>{ title }</h2>
      <p className={ bem('value') }>{ value }</p>
    </div>
  </div>
)

export default UnavailabilityDetail
