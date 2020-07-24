import React, { memo, useMemo, useCallback } from 'react'
import { truncate } from 'lodash/fp'

import { IconButton, Lozenge, RangeType, FormInputElement } from '@skedulo/sked-ui'
import { IJobDetail, IJobSuggestion, ISwimlaneSettings } from '../../commons/types'
import { JOB_STATUS_COLOR } from '../../commons/constants'
import ScheduleTimeslots from './ScheduleTimeslots'

interface IJobRowProps {
  job: IJobDetail
  suggestions: IJobSuggestion[]
  getSuggestions: (job: IJobDetail, hasSuggestions: boolean) => void
  shouldSuggest: boolean
  projectTimezone: string
  dateRange: Date[]
  rangeType: RangeType
  swimlaneSettings: ISwimlaneSettings
  openAllocationModal: (job: IJobDetail, zonedDate?: string, zonedTime?: number) => void
  navigateToJob: (startDate: Date) => void
  onDragJob: (job: IJobDetail, newDate: string, newTime: number) => void
  onViewJobDetail: (jobId: string) => void
  onSelectRow: (job: IJobDetail) => void
  isSelectedRow: boolean
}

const JobRow: React.FC<IJobRowProps> = props => {
  const {
    suggestions,
    job,
    getSuggestions,
    shouldSuggest,
    projectTimezone,
    dateRange,
    rangeType,
    swimlaneSettings,
    openAllocationModal,
    navigateToJob,
    onDragJob,
    onViewJobDetail,
    onSelectRow,
    isSelectedRow
  } = props

  const { jobSuggestions, hasSuggestions } = useMemo(() => {
    const matchedSuggestions = suggestions.filter(suggestion => suggestion.jobId === job.id)
    return { jobSuggestions: matchedSuggestions, hasSuggestions: matchedSuggestions.length > 0}
  }, [suggestions, job])

  const handleGetSuggestions = useCallback(() => getSuggestions(job, hasSuggestions), [job, hasSuggestions])
  const handleViewJob = useCallback(() => onViewJobDetail(job.id), [job])
  const handleSelectRow = useCallback(() => onSelectRow(job), [job])

  return (
    <div key={job.id} className="schedule-row">
      <div className="cx-flex schedule-item-job cx-text-neutral-900">
        <div className="cx-flex cx-w-1/3 cx-items-center">
          <FormInputElement checked={isSelectedRow} onChange={handleSelectRow} type="checkbox" className="cx-mr-4" />
          <div className="cx-cursor-pointer" onClick={handleViewJob}>
            <p className="cx-font-medium hover:cx-text-primary">{job.name}</p>
            <p>{truncate({ length: 50 }, job.description)}</p>
          </div>
        </div>
        <div className="cx-w-1/3">
          <Lozenge label={job.status} color={JOB_STATUS_COLOR[job.status] || 'neutral'} size="small" />
        </div>
        <div className="cx-w-1/3">
          <p>{job.jobType}</p>
        </div>
        <div className="cx-min-w-36px">
          {!job.startDate && shouldSuggest && (
            <IconButton
              buttonType="transparent"
              icon="suggest"
              tooltipContent={hasSuggestions ? 'Hide suggestions' : 'Show suggestions'}
              active={hasSuggestions}
              onClick={handleGetSuggestions}
            />
          )}
        </div>
      </div>
      <div className="schedule-item-weekday">
        <ScheduleTimeslots
          projectTimezone={projectTimezone}
          dateRange={dateRange}
          rangeType={rangeType}
          swimlaneSettings={swimlaneSettings}
          openAllocationModal={openAllocationModal}
          job={job}
          navigateToJob={navigateToJob}
          suggestions={jobSuggestions}
          dragJob={onDragJob}
        />
      </div>
    </div>
  )
}

export default memo(JobRow)
