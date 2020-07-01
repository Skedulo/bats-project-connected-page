import React, { useState } from 'react'

import { classes } from '../../../common/utils/classes'
import { Button } from '@skedulo/sked-ui'

import './cells.scss'

const bem = classes('available-resources-cell')

const maxAvatarsVisible = 6

interface AvatarProps {
  src: string,
}

interface AvatarsProps {
  availableResources: {
    name: string,
    avatarUrl: string,
  }[],
}

const Avatar: React.FC<AvatarProps> = ({ src }) => (
  <div className={ bem('avatar') } style={ { backgroundImage: `url(${src})` } } />
)

const AvatarsGroup: React.FC<AvatarsProps> = ({ availableResources }) => {
  const [truncatedResourcesVisible, toggleTruncatedResourcesVisibility] = useState(false)

  return (
    availableResources.map((resource: string, i: number) => {
      if (availableResources.length <= maxAvatarsVisible) {
        return <Avatar src={ resource.avatarUrl } key={ i } />
      } else {
        if (i <= maxAvatarsVisible - 2) {
          return <Avatar src={ resource.avatarUrl } key={ i } />
        } else if ( i === maxAvatarsVisible - 1 ) {
          const truncatedResources = availableResources.slice(maxAvatarsVisible - 1)

          return (
            <div className={ bem('truncated-resources-wrapper') } key={ i }>
              <div
                className={ bem('truncated-resources-number') }
                onClick={ () => toggleTruncatedResourcesVisibility(!truncatedResourcesVisible) }
              >
                +{ availableResources.length - (maxAvatarsVisible - 1) }
              </div>
              { truncatedResourcesVisible &&
                <div className={ bem('truncated-resources-list') }>
                  <ul>
                    { truncatedResources.map((resource, i) => (
                      <li key={ i }>
                        <Avatar src={ resource.avatarUrl } />
                        <span>{ resource.name }</span>
                      </li>
                    )) }
                  </ul>
                </div>
              }
            </div>
          )
        }
      }
    })
  )
}

const AvailableResourcesCell: React.FC<AvatarsProps> = ({ availableResources }) => (
  null
  /*
  <div className={ bem() }>
    <div className={ bem('avatars') }>
      <AvatarsGroup availableResources={ availableResources } />
    </div>
    <Button buttonType="secondary">Reschedule</Button>
  </div>
  */
)

export default AvailableResourcesCell
