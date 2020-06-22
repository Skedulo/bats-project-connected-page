import React, { memo } from 'react'
import { times, toNumber } from 'lodash/fp'
import classnames from 'classnames'

import { Avatar } from '@skedulo/sked-ui'
import { parseDurationValue } from '../../commons/utils'
import { IJobDetail } from '../../commons/types'

interface IScheduledJobProps {
  job: IJobDetail
  jobPosition: string
  travelTimeStyle: Record<string, string>
  durationStyle: Record<string, string>
  travelTime: number
}

const ScheduledJob: React.FC<IScheduledJobProps> = ({
  job,
  jobPosition,
  travelTime,
  travelTimeStyle,
  durationStyle
}) => {
  const resources: React.ReactNode[] = []
  const time = Math.max(job.allocations?.length || 0, toNumber(job.resourceRequirement))
  times(index => {
    const jobAllocation = job.allocations ? job.allocations[index] : null

    resources.push(
      <Avatar
        name={jobAllocation?.resource?.name || ''}
        key={`resourcerquired-${index}`}
        className={classnames('cx-ml-1 first:cx-ml-0', {
          'cx-bg-blue-100 cx-border cx-border-dotted cx-border-blue-500': !jobAllocation
        })}
        showTooltip={!!jobAllocation?.resource?.name}
        size="small"
        preserveName={false}
      />
    )
  }, time > 0 ? time : 1)

  return (
    <div className="cx-flex cx-items-center cx-absolute cx-z-1" style={{
      height: '80%',
      left: jobPosition,
    }}>
      {travelTime > 0 && (
        <span className="cx-bg-neutral-500" style={travelTimeStyle} />
      )}
      <span className="cx-h-full" style={durationStyle} />
      <span className="cx-flex">
        {resources}
        {/* <GroupAvatars
          totalSlots={time > 0 ? time : 1}
          maxVisibleSlots={5}
          avatarInfo={resources}
          size="medium"
        /> */}
      </span>
      <span className="cx-pl-2" style={{ width: 'max-content' }}>
        {parseDurationValue(job.duration)}
      </span>
    </div>
  )
}

export default memo(ScheduledJob)
