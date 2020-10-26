import React, { memo, useMemo, ReactNode } from 'react'
import { Avatar, Tooltip, Icon } from '@skedulo/sked-ui'

import { Resource } from '../../types'

interface ResourceCardProps {
  resource: Resource
  actionButton?: ReactNode
  className?: string
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, actionButton, className }) => {
  const tags = useMemo(() => resource.tags?.map(item => item.name) || [], [resource.tags])

  return (
    <div className={`cx-bg-white cx-flex cx-items-center cx-justify-between ${className || ''}`}>
      <div className="cx-flex cx-items-center">
        <Avatar imageUrl={resource.avatarUrl} name={resource.name} size="tiny" />
        <div className="cx-ml-2">
          <div className="cx-font-semibold">{resource.name}</div>
          {resource.category && <div className="cx-text-neutral-600 cx-text-xs cx-mt-1">{resource.category}</div>}
        </div>
      </div>
      <div className="cx-flex cx-items-center">
        <Tooltip content={tags.length > 0 ? tags.join(', ') : 'No assigned tags.'} position="top">
          <Icon name="tag" className="cx-text-neutral-600" />
        </Tooltip>
        {actionButton}
      </div>
    </div>
  )
}

export default memo(ResourceCard)
