import React, { useEffect, useState, useCallback, memo, useMemo } from 'react'
import { debounce, uniq, keyBy, times, toNumber } from 'lodash/fp'
import classnames from 'classnames'
import { format } from 'date-fns-tz'
import { getDaysInMonth, eachDayOfInterval, add, isToday } from 'date-fns'
import {
  Button,
  CalendarControls,
  RangeType,
  Icon,
  Pagination,
  Avatar,
} from '@skedulo/sked-ui'
import JobFilter from './JobFilter'
import LoadingTrigger from '../../commons/components/GlobalLoading/LoadingTrigger'
import {
  IJobDetail,
  IListResponse,
  IFilterParams,
  IJobFilterParams,
  IJobTypeTemplate,
  IConfig,
  IProjectDetail,
  ITimeOption,
} from '../../commons/types'
import { DEFAULT_FILTER, DEFAULT_LIST, SCHEDULE_JOB_STATUS_COLOR, DATE_FORMAT } from '../../commons/constants'
import {
  fetchListJobs,
  fetchJobTypeTemplateValues,
} from '../../Services/DataServices'
import { AppContext } from '../../App'
import SearchBox from '../../commons/components/SearchBox'
import { createJobPath, jobDetailPath } from '../routes'
import { getTimePickerOptions, parseDurationValue } from '../../commons/utils'
import './styles.scss'

interface IScheduleTabProps {
  project: IProjectDetail
}

const SLOT_WIDTH = 50

const getJobsTableCells = (selectedDate: Date, rangeType: RangeType, job?: IJobDetail) => {
  const timeGap = rangeType === 'day' ? 60 : rangeType === 'week' ? 240 : 1440
  const timeCols = getTimePickerOptions(timeGap)
  const dateRange = eachDayOfInterval({
    start: selectedDate,
    end: add(selectedDate, {
      days: (rangeType === 'day' ? 1 : rangeType === 'week' ? 7 : getDaysInMonth(selectedDate)) - 1
    })
  })
  const cols = timeCols.length *  dateRange.length
  const dateCols: React.ReactElement[] = []
  let currentTimePosition = null

  dateRange.forEach((date, index) => {
    const formattedWeekday = rangeType !== 'month' ? format(date, 'EEEE dd') : format(date, 'eee dd')
    const today = isToday(date)
    if (today) {
      const currentDate = new Date()
      const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes()
      currentTimePosition = (currentTime / 1440) * SLOT_WIDTH * timeCols.length + index * SLOT_WIDTH * timeCols.length
    }

    if (!job) {
      dateCols.push(
        <div
          key={formattedWeekday}
          className={classnames('day cx-w-full cx-uppercase', {
            'cx-text-primary': !!today
          })}
          style={{
            gridColumnStart: index * timeCols.length + 1,
            gridColumnEnd: index * timeCols.length + 1 + timeCols.length,
            justifySelf: 'center',
          }
        }>
          {formattedWeekday}
        </div>
      )
    }
  })

  if (job || rangeType !== 'month') {
    times(dateRangeIndex => {
      timeCols.forEach((item: ITimeOption, indexTime) => {
        if (!job) {
          // display schedule timeslot of a day
          dateCols.push(
            <div className="timeslot" key={`${item.stringValue}-${dateRangeIndex}`}>
              {item.stringValue}
            </div>
          )
        } else {
          // display schedule data
        const formattedDateString = format(dateRange[dateRangeIndex], DATE_FORMAT)
        let matched = formattedDateString === job.startDate && job.startTime >= item.numberValue
        const resources: React.ReactNode[] = []
        if (timeCols[indexTime + 1]) {
          matched = matched && job.startTime < timeCols[indexTime + 1].numberValue
        }
        if (matched) {
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
        }

        dateCols.push(
          <div className="timeslot" key={`${item.stringValue}-${dateRangeIndex}`}>
            {matched && (
              <div className="cx-flex cx-items-center cx-absolute" style={{
                height: '80%',
                zIndex: 1,
                left: `${((job.startTime - item.numberValue) / timeGap) * 50}px`,
              }}>
                <span className="cx-h-full" style={{
                  width: `${(job.duration / timeGap) * SLOT_WIDTH}px`,
                  backgroundColor: SCHEDULE_JOB_STATUS_COLOR[job.status],
                }} />
                <span className="cx-flex">
                  {resources}
                </span>
                <span className="cx-pl-2" style={{ width: 'max-content' }}>
                  {parseDurationValue(job.duration)}
                </span>
              </div>
            ) }
          </div>
        )
        }
      })
    }, dateRange.length)
  }

  return (
    <>
      <div className="cx-grid cx-h-full" style={{
        gridTemplateColumns: `repeat(${cols}, ${SLOT_WIDTH}px)`,
      }}>
        {dateCols}
        {currentTimePosition !== null && (
          <div
            className="cx-absolute cx-h-full current-time-indicator"
            style={{
              left: `calc(30% + ${currentTimePosition}px)`,
            }}
          />
        )}
      </div>
    </>
  )
}

const ScheduleTab: React.FC<IScheduleTabProps> = ({ project }) => {
  const appContext = React.useContext(AppContext)

  const { jobTypeTemplates = [], jobTypeTemplateValues = {} } = useMemo(() => appContext?.config || {}, [
    appContext,
  ])

  const setAppConfig = useMemo(() => appContext?.setAppConfig, [appContext])

  const jobTypeTemplateValueKeys = useMemo(() => Object.keys(jobTypeTemplateValues), [jobTypeTemplateValues])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [filterParams, setFilterParams] = useState<IJobFilterParams>(DEFAULT_FILTER)

  const [jobs, setJobs] = useState<IListResponse<IJobDetail>>(DEFAULT_LIST)

  const [selectedRows, setSelectedRows] = useState<IJobDetail[]>([])

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [selectedDateRange, setSelectedDateRange] = useState<RangeType>('week')

  const totalCount = useMemo(() => {
    let totalDuration = 0
    let totalTravelTime = 0
    let avgTravelTime = 0

    if (jobs.results.length) {
      jobs.results.forEach(job => {
        if (job.duration) {
          totalDuration += job.duration
        }
        if (job.travelTime) {
          totalTravelTime += job.travelTime
        }
      })
      avgTravelTime = totalTravelTime / jobs.results.length
    }
    return { totalDuration, totalTravelTime, avgTravelTime }
  }, [jobs.results])

  const getJobsList = useCallback(async (params: IJobFilterParams) => {
    setIsLoading(true)
    const res = await fetchListJobs(params)
    if (res) {
      // get resource requirements
      const jobTypes = uniq(res.results.map((item: IJobDetail) => item.jobType))
      const templates = jobTypeTemplates.filter(
        (template: IJobTypeTemplate) =>
          jobTypes.includes(template.name) && !jobTypeTemplateValueKeys.includes(template.name)
      )
      let newJobTypeTemplateValues = { ...jobTypeTemplateValues }
      if (templates.length > 0) {
        const promises = templates.map((template: IJobTypeTemplate) =>
          fetchJobTypeTemplateValues(template.id, template.name)
        )
        const responses = await Promise.all(promises)
        newJobTypeTemplateValues = { ...newJobTypeTemplateValues, ...keyBy('jobType', responses) }

        if (setAppConfig) {
          setAppConfig((prev: IConfig) => {
            return ({ ...prev, jobTypeTemplateValues: newJobTypeTemplateValues })
          })
        }
      }

      const jobsWithResourceRequirement =
        res.results.length > 0
          ? res.results.map((item: IJobDetail) => {
              return {
                ...item,
                resourceRequirement: newJobTypeTemplateValues[item.jobType]
                  ? newJobTypeTemplateValues[item.jobType].totalQty
                  : 1,
              }
            })
          : []
      setJobs({ ...res, results: jobsWithResourceRequirement })
    }
    setIsLoading(false)
  }, [])

  const debounceGetJobList = useMemo(() => debounce(700, getJobsList), [getJobsList])

  const onPageChange = useCallback((page: number) => {
    setFilterParams((prev: IJobFilterParams) => ({ ...prev, pageNumber: page }))
  }, [])

  const onSearchTextChange = useCallback((value: string) => {
    onFilterChange({ searchText: value })
  }, [])

  const onResetFilter = useCallback(() => {
    setFilterParams(DEFAULT_FILTER)
  }, [])

  const onFilterChange = useCallback((params: IFilterParams) => {
    setFilterParams((prev: IFilterParams) => ({ ...prev, ...params }))
  }, [])

  const onCreateJob = useCallback(() => {
    let preFillStr = `form.ProjectId=${project?.id}`
    if (project.account?.id && project.applyAccountForAllJob) {
      preFillStr = preFillStr + `&form.AccountId=${project.account?.id}`
    }
    if (project.contact?.id && project.applyContactForAllJob) {
      preFillStr = preFillStr + `&form.ContactId=${project.contact?.id}`
    }
    if (project.region?.id && project.applyRegionForAllJob) {
      preFillStr = preFillStr + `&form.RegionId=${project.region?.id}`
    }
    if (project.location?.id && project.applyLocationForAllJob) {
      preFillStr = preFillStr + `&form.LocationId=${project.location?.id}`
    }
    window.top.window.location.href = `${createJobPath()}?${preFillStr}`
  }, [project])

  const onViewJobDetail = useCallback((jobId: string) => {
    window.top.window.location.href = jobDetailPath(jobId)
  }, [])

  const onDateRangeSelect = useCallback((range: RangeType) => {
    setSelectedDateRange(range)
  }, [])

  const onDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  useEffect(() => {
    if (!isLoading && project?.id) {
      debounceGetJobList({...filterParams, projectId: project?.id })
    }
  }, [filterParams, project])

  useEffect(() => {
    const endDate = add(selectedDate, {
      days: (selectedDateRange === 'day' ? 1 : selectedDateRange === 'week' ? 7 : getDaysInMonth(selectedDate)) - 1
    })
    onFilterChange({
      startDate: format(selectedDate, DATE_FORMAT),
      endDate: format(endDate, DATE_FORMAT)
    })
  }, [selectedDate, selectedDateRange])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-px-8 cx-top-0 cx-bg-white cx-z-10">
        <JobFilter
          onResetFilter={onResetFilter}
          onFilterChange={onFilterChange}
          filterParams={filterParams}
          noDateFilter={true}
        />
        <div className="cx-flex cx-aligns-center cx-justify-between cx-py-2 cx-border-b cx-border-t cx-border-neutral-300">
          <Button buttonType="transparent" onClick={onCreateJob} icon="plus">
            New Job
          </Button>
          <div className="cx-flex cx-aligns-center">
            <CalendarControls
              rangeOptions={['day', 'week', 'month']}
              selected={selectedDate}
              onDateSelect={onDateSelect}
              selectedRange={selectedDateRange}
              onRangeChange={onDateRangeSelect}
            />
          </div>
        </div>
      </div>
      <div className="cx-p-4">
        <div className="schedule-general-info cx-text-neutral-700">
          <div className="general-info-item">
            <SearchBox
              className="cx-h-full cx-px-4 cx-py-0 cx-mb-0 cx-border-0"
              onChange={onSearchTextChange}
              placeholder="jobs"
              clearable={!!filterParams.searchText}
              value={filterParams.searchText || ''}
              autoFocus={false}
            />
          </div>
          <div className="general-info-item cx-p-4 cx-flex cx-justify-between cx-border-l-0">
            <div className="cx-flex">
              <Icon name="time" />
              <span className="cx-px-2">
                {totalCount.totalTravelTime > 0 ? parseDurationValue(totalCount.totalTravelTime) : '-'}
              </span>
              <Icon name="calendar" />
              <span className="cx-px-2">
                {totalCount.totalDuration > 0 ? parseDurationValue(totalCount.totalDuration) : '-'}
              </span>
              <Icon name="location" />
              <span className="cx-px-2">
                {totalCount.avgTravelTime > 0 ? parseDurationValue(totalCount.avgTravelTime) : '-'}
              </span>
            </div>
            {/* <div>Thame Valley</div> */}
          </div>
        </div>
        <div className="cx-text-neutral-700 cx-overflow-x-scroll schedule-table cx-relative">
          <div className="schedule-row">
            <div className="schedule-item-job cx-flex cx-uppercase">
              <div className="cx-w-2/3">Name/Description</div>
              <div className="cx-w-1/3">Job Type</div>
            </div>
            <div className="schedule-item-weekday">
              {getJobsTableCells(selectedDate, selectedDateRange)}
            </div>
          </div>
          {
            jobs.results.map(job => {
              return (
                <div key={job.id} className="schedule-row">
                  <div className="cx-flex schedule-item-job cx-text-neutral-900">
                    <div className="cx-w-2/3">
                      <p>{job.name}</p>
                      <p>{job.description}</p>
                    </div>
                    <div className="cx-w-1/3">
                      <p>{job.jobType}</p>
                    </div>
                  </div>
                  <div className="schedule-item-weekday">
                    {getJobsTableCells(selectedDate, selectedDateRange, job)}
                  </div>
                </div>
              )
            })
          }
        </div>

        {!jobs.results.length && (
            <div className="cx-text-center cx-p-4">No job found.</div>
        )}

        {jobs.totalItems > 0 && (
          <Pagination
            itemsTotal={jobs.totalItems}
            itemsPerPage={filterParams.pageSize || 0}
            currentPage={filterParams.pageNumber || 1}
            onPageChange={onPageChange}
            className="cx-static"
          />
        )}
      </div>
    </div>
  )
}

export default memo(ScheduleTab)
