import React, { useEffect, useState, useCallback, memo, useMemo } from 'react'
import { debounce, uniq, keyBy, truncate, xor, fill, pickBy } from 'lodash/fp'
import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { getDaysInMonth, add, isAfter, set, eachDayOfInterval } from 'date-fns'
import {
  Button,
  CalendarControls,
  RangeType,
  Icon,
  Pagination,
  PopOut,
  IconButton,
  Tooltip,
  FormInputElement,
  ButtonGroup
} from '@skedulo/sked-ui'
import JobFilter from './JobFilter'
import SwimlaneSetting from './SwimlaneSetting'
import AllocationModal from './AllocationModal'
import ScheduleTimeslots from './ScheduleTimeslots'
import LoadingTrigger from '../../commons/components/GlobalLoading/LoadingTrigger'
import {
  IJobDetail,
  IListResponse,
  IFilterParams,
  IJobFilterParams,
  IJobTypeTemplate,
  IConfig,
  IProjectDetail,
  ISwimlaneSettings,
  IJobSuggestion,
} from '../../commons/types'
import {
  DEFAULT_FILTER,
  DEFAULT_LIST,
  DATE_FORMAT,
  DEFAULT_SWIMLANE_SETTINGS,
  LOCAL_STORAGE_KEY,
  ALLOWED_DISPATCH_STATUS,
  ALLOWED_DEALLOCATE_STATUS,
  ALLOWED_UNSCHEDULE_STATUS
} from '../../commons/constants'
import {
  fetchListJobs,
  fetchJobTypeTemplateValues,
  getJobSuggestion,
  updateJobTime,
  allocationResources,
  dispatchMutipleJobs,
  deallocateMutipleJobs,
  unscheduleMutipleJobs
} from '../../Services/DataServices'
import { AppContext } from '../../App'
import SearchBox from '../../commons/components/SearchBox'
import JobRow from './JobRow'
import { createJobPath, jobDetailPath } from '../routes'
import { parseDurationValue, getLocalStorage,  setLocalStorage, parseTimeValue, extractTimeValue, toastMessage } from '../../commons/utils'
import './styles.scss'

interface IScheduleTabProps {
  project: IProjectDetail
}

interface IAllocationModal {
  isOpen: boolean
  job: IJobDetail | null
  zonedDate: string
  zonedTime: number
}

const DEFAULT_ALLOCATION_MODAL = {
  isOpen: false,
  job: null,
  zonedDate: '',
  zonedTime: 0
}

const ScheduleTab: React.FC<IScheduleTabProps> = ({ project }) => {
  const appContext = React.useContext(AppContext)

  const { jobTypeTemplates = [], jobTypeTemplateValues = {} } = useMemo(() => appContext?.config || {}, [
    appContext,
  ])

  const setAppConfig = useMemo(() => appContext?.setAppConfig, [appContext])

  const jobTypeTemplateValueKeys = useMemo(() => Object.keys(jobTypeTemplateValues), [jobTypeTemplateValues])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [allocationModal, setAllocationModal] = useState<IAllocationModal>(DEFAULT_ALLOCATION_MODAL)

  const [filterParams, setFilterParams] = useState<IJobFilterParams>(DEFAULT_FILTER)

  const [jobs, setJobs] = useState<IListResponse<IJobDetail>>(DEFAULT_LIST)

  const [swimlaneSettings, setSwimlaneSettings] = useState<ISwimlaneSettings>(DEFAULT_SWIMLANE_SETTINGS)

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [selectedRangeType, setSelectedRangeType] = useState<RangeType>('day')

  const [selectedRows, setSelectedRows] = useState<IJobDetail[]>([])

  const [suggestions, setSuggestions] = useState<IJobSuggestion[]>([])

  const [canDeallocate, setCanDeallocate] = useState<boolean>(true)

  const [canDispatch, setCanDispatch] = useState<boolean>(true)

  const [canUnschedule, setCanUnschedule] = useState<boolean>(true)

  const selectedRowIds = useMemo(() => selectedRows.map(item => item.id), [selectedRows])

  const dateRange = useMemo(() => {
    let range = eachDayOfInterval({
      start: selectedDate,
      end: add(selectedDate, {
        days: (selectedRangeType === 'day' ? 1 : selectedRangeType === 'week' ? 7 : getDaysInMonth(selectedDate)) - 1
      })
    })
    if (swimlaneSettings.workingHours.enabled && ['week', 'month'].includes(selectedRangeType)) {
      range = range.filter(date => {
        const excludeDays = Object.keys(pickBy(value => !value, swimlaneSettings.workingHours.days))
        return !excludeDays.includes(format(date, 'EEEE').toLowerCase())
      })
    }
    return range
  }, [selectedDate, selectedRangeType, swimlaneSettings])

  const shouldSuggest = useMemo(() => {
    const currentDate = format(new Date(), DATE_FORMAT)
    const minDate = format(dateRange[0], DATE_FORMAT)
    const maxDate = format(dateRange[dateRange.length - 1], DATE_FORMAT)
    return (minDate >= currentDate || maxDate >= currentDate)
  }, [dateRange])

  const totalCount = useMemo(() => {
    let totalDuration = 0
    let totalTravelTime = 0
    let avgTravelTime = 0
    const totalAllocations = jobs.results.length || 0

    if (jobs.results.length) {
      jobs.results.forEach(job => {
        if (job.duration) {
          totalDuration += job.duration
        }
        if (job.allocations) {
          job.allocations.forEach(allocation => {
            // totalAllocations += 1
            if (allocation.plannedTravelTime) {
              totalTravelTime += allocation.plannedTravelTime
            }
          })
        }
      })
      avgTravelTime = Math.round(totalTravelTime / totalAllocations)
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

  const getSuggestions = useCallback(async (job: IJobDetail, hasSuggestions: boolean) => {
    if (hasSuggestions) {
      setSuggestions(suggestions.filter(suggestion => suggestion.jobId !== job.id))
      return
    }
    let startTime = { hours: 0, minutes: 0, seconds: 0 }
    let endTime = { hours: 23, minutes: 59, seconds: 59 }
    if (swimlaneSettings.workingHours.enabled) {
      startTime = extractTimeValue(swimlaneSettings.workingHours.startTime)
      endTime = extractTimeValue(swimlaneSettings.workingHours.endTime)
    }
    let startDate = set(dateRange[0], startTime)
    const currentDate = utcToZonedTime(new Date((new Date().toISOString())), project.timezoneSid)
    if (isAfter(currentDate, startDate)) {
      startDate = currentDate
    }
    const endDate = set(dateRange[dateRange.length - 1], endTime)

    setIsLoading(true)
    const res = await getJobSuggestion(
      job.id,
      job.region.id,
      zonedTimeToUtc(startDate, project.timezoneSid).toISOString(),
      zonedTimeToUtc(endDate, project.timezoneSid).toISOString(),
      project.timezoneSid
    )
    setSuggestions(prev => ([...prev, ...res]))
    setIsLoading(false)
  }, [project, dateRange, suggestions, swimlaneSettings.workingHours])

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
    setSelectedRangeType(range)
  }, [])

  const onDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const onTodayClick = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  // handle open allocation modal, if the date time params are passed, we will schedule job first,
  // then open the modal to make sure the resource suggestion api works correctly
  const openAllocationModal = useCallback(async (job: IJobDetail, zonedDate?: string, zonedTime?: number) => {
    if (zonedDate && zonedTime) {
      const success = await handleDragJob(job, zonedDate, zonedTime)
      if (success) {
        await getJobsList({...filterParams, projectId: project.id })
        getSuggestions(job, true)
        setAllocationModal({
          isOpen: true,
          job,
          zonedDate,
          zonedTime
        })
      }
      return
    }
    setAllocationModal({
      isOpen: true,
      job,
      zonedDate: job.startDate,
      zonedTime: job.startTime
    })
  }, [filterParams, project.id])

  const closeAllocationModal = useCallback(() => {
    setAllocationModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  const navigateToJob = useCallback((startDate: Date) => {
    onDateSelect(startDate)
  }, [])

  const handleDragJob = useCallback(async (job: IJobDetail, newDate: string, newTime: number) => {
    setIsLoading(true)
    const success = await updateJobTime({
      id: job.id,
      startDate: newDate,
      startTime: newTime,
      duration: job.duration,
      timezoneSid: job.timezoneSid
    })

    if (success) {
      const jobIndex = jobs.results.findIndex(item => item.id === job.id)
      setJobs(prev => ({
        ...prev,
        results: fill(jobIndex, jobIndex + 1, {
          ...prev.results[jobIndex],
          startDate: newDate,
          startTime: newTime,
          startTimeString: parseTimeValue(newTime)
        }, prev.results)
      }))
    } else {
      toastMessage.error('Somethings went wrong!')
    }
    setIsLoading(false)
    return success
  }, [jobs])

  const handleAllocation = useCallback(async (job: IJobDetail, resourceIds: string[]) => {
    setIsLoading(true)
    const allocatedResourceIds = allocationModal.job?.allocations?.map(item => item.resource.id) || []
    const needingAllocationResources = xor(allocatedResourceIds, resourceIds)
    const isAllocationSuccess = await allocationResources(job.id, needingAllocationResources)
    closeAllocationModal()
    setIsLoading(false)
    if (isAllocationSuccess) {
      getJobsList({...filterParams, projectId: project.id })
      getSuggestions(job, true)
    }
  }, [filterParams, project.id, allocationModal.job])

  const swimlaneSettingTrigger = useCallback(() => {
    return (
      <IconButton
        icon="settings"
        buttonType="transparent"
        tooltipContent="Swimlane Settings"
      />
    )
  }, [])

  const applySwimlaneSetting = useCallback((settings: ISwimlaneSettings) => {
    setSwimlaneSettings(settings)
    setLocalStorage(LOCAL_STORAGE_KEY.PROJECT_SWIMLANE_SETTINGS, JSON.stringify(settings))
  }, [])

  const handleSelectAllRows = React.useCallback(e => {
    setSelectedRows(e.target.checked ? jobs.results : [])
  }, [jobs.results])

  const handleSelectRow = React.useCallback((job: IJobDetail) => {
    setSelectedRows(prev => {
      const newSelectedRow = [...prev]

      if (prev.find(item => item.id === job.id)) {
        return newSelectedRow.filter(item => item.id !== job.id)
      }
      newSelectedRow.push(job)
      return newSelectedRow
    })
  }, [setSelectedRows])

  const handleDispatchResource = useCallback(async () => {
    const jobIds = selectedRows.filter(job => ALLOWED_DISPATCH_STATUS.includes(job.status)).map(job => job.id).join(',')
    setIsLoading(true)
    const success = await dispatchMutipleJobs(jobIds)
    setIsLoading(false)
    if (success) {
      getJobsList({ ...filterParams, projectId: project.id })
      toastMessage.success('Dispatched successfully!')
    } else {
      toastMessage.success('Dispatched unsuccessfully!')
    }
  }, [selectedRows, filterParams, project.id])

  const handleDeallocate = useCallback(async () => {
    const jobIds = selectedRows
      .filter(job => ALLOWED_DEALLOCATE_STATUS.includes(job.status))
      .map(job => job.id).join(',')
    setIsLoading(true)
    const success = await deallocateMutipleJobs(jobIds)
    setIsLoading(false)
    if (success) {
      getJobsList({ ...filterParams, projectId: project.id })
      toastMessage.success('Deallocated successfully!')
    } else {
      toastMessage.success('Deallocated unsuccessfully!')
    }
  }, [selectedRows, filterParams, project])

  const handleUnschedule = useCallback(async () => {
    const jobIds = selectedRows
      .filter(job => ALLOWED_UNSCHEDULE_STATUS.includes(job.status))
      .map(job => job.id).join(',')
    setIsLoading(true)
    const success = await unscheduleMutipleJobs(jobIds)
    setIsLoading(false)
    if (success) {
      setSelectedRows([])
      getJobsList({ ...filterParams, projectId: project.id })
      toastMessage.success('Unscheduled successfully!')
    } else {
      toastMessage.success('Unscheduled unsuccessfully!')
    }
  }, [selectedRows, filterParams, project])

  useEffect(() => {
    if (!isLoading && project.id) {
      debounceGetJobList({...filterParams, projectId: project.id })
    }
  }, [filterParams, project])

  useEffect(() => {
    const savedSettings = getLocalStorage(LOCAL_STORAGE_KEY.PROJECT_SWIMLANE_SETTINGS)
    if (savedSettings) {
      setSwimlaneSettings(JSON.parse(savedSettings))
    }
  }, [])

  useEffect(() => {
    const shouldDeallocation = !!selectedRows.find(
      (job: IJobDetail) => job.allocations?.length > 0 && ALLOWED_DEALLOCATE_STATUS.includes(job.status))
    const shouldDispatch = !!selectedRows.find((job: IJobDetail) => ALLOWED_DISPATCH_STATUS.includes(job.status))
    const shouldUnschedule = !!selectedRows.find((job: IJobDetail) => ALLOWED_UNSCHEDULE_STATUS.includes(job.status))

    setCanDeallocate(shouldDeallocation)
    setCanDispatch(shouldDispatch)
    setCanUnschedule(shouldUnschedule)
  }, [selectedRows])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-top-0 cx-bg-white cx-z-10">
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
          <div className="cx-flex cx-aligns-center cx-pr-4">
            {selectedRows.length > 0 && (
              <ButtonGroup className="cx-mr-2">
                <Button buttonType="secondary" disabled={!canUnschedule} onClick={handleUnschedule}>
                  Unschedule
                </Button>
                <Button buttonType="secondary" disabled={!canDeallocate} onClick={handleDeallocate}>
                  Deallocate
                </Button>
                <Button buttonType="primary" disabled={!canDispatch} onClick={handleDispatchResource}>
                  Dispatch
                </Button>
              </ButtonGroup>
            )}
            <CalendarControls
              rangeOptions={['day', 'week', 'month']}
              selected={selectedDate}
              onDateSelect={onDateSelect}
              selectedRange={selectedRangeType}
              onRangeChange={onDateRangeSelect}
              onTodayClick={onTodayClick}
            />
            <PopOut
              placement="bottom"
              closeOnOuterClick={false}
              closeOnScroll={false}
              closeOnFirstClick={false}
              trigger={swimlaneSettingTrigger}
            >
              {togglePopout => (
                <SwimlaneSetting
                  defaultSetting={swimlaneSettings}
                  hideSetting={togglePopout}
                  applySetting={applySwimlaneSetting}
                />
              )}
            </PopOut>
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
              <Tooltip content="Total Travel Time" position="top">
                <div className="cx-flex">
                  <Icon name="time" />
                  <span className="cx-px-2">
                    {totalCount.totalTravelTime > 0 ? parseDurationValue(totalCount.totalTravelTime) : '--'}
                  </span>
                </div>
              </Tooltip>
              <Tooltip content="Total Scheduled Time" position="top">
                <div className="cx-flex">
                  <Icon name="calendar" />
                  <span className="cx-px-2">
                    {totalCount.totalDuration > 0 ? parseDurationValue(totalCount.totalDuration) : '--'}
                  </span>
                </div>
              </Tooltip>
              <Tooltip content="Average Travel Time" position="top">
                <div className="cx-flex">
                  <Icon name="location" />
                  <span className="cx-px-2">
                    {totalCount.avgTravelTime > 0 ? parseDurationValue(totalCount.avgTravelTime) : '--'}
                  </span>
                </div>
              </Tooltip>
            </div>
            <div>{`${project.region?.name} ${format(new Date(), 'zzz', { timeZone: project.timezoneSid })}`}</div>
          </div>
        </div>
        <div className="cx-text-neutral-700 cx-overflow-x-scroll schedule-table cx-relative">
          <div className="schedule-row">
            <div className="schedule-item-job cx-flex cx-uppercase cx-items-center cx-font-medium">
              <div className="cx-w-1/3 cx-flex cx-items-center">
                <FormInputElement
                  type="checkbox"
                  onChange={handleSelectAllRows}
                  checked={jobs.results.length === selectedRows.length && jobs.results.length > 0}
                  className="cx-mr-4"
                />
                <span>Name/Description</span>
              </div>
              <div className="cx-w-1/3">Status</div>
              <div className="cx-w-1/3">Job Type</div>
            </div>
            <div className="schedule-item-weekday">
              <ScheduleTimeslots
                projectTimezone={project.timezoneSid}
                dateRange={dateRange}
                rangeType={selectedRangeType}
                swimlaneSettings={swimlaneSettings}
              />
            </div>
          </div>
          {jobs.results.map(job => (
            <JobRow
              key={job.id}
              job={job}
              suggestions={suggestions}
              getSuggestions={getSuggestions}
              shouldSuggest={shouldSuggest}
              projectTimezone={project.timezoneSid}
              dateRange={dateRange}
              rangeType={selectedRangeType}
              swimlaneSettings={swimlaneSettings}
              openAllocationModal={openAllocationModal}
              navigateToJob={navigateToJob}
              onDragJob={handleDragJob}
              onViewJobDetail={onViewJobDetail}
              onSelectRow={handleSelectRow}
              isSelectedRow={selectedRowIds.includes(job.id)}
            />
          ))}
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
      {allocationModal.job && (
        <AllocationModal
          isOpen={allocationModal.isOpen}
          onClose={closeAllocationModal}
          job={allocationModal.job}
          zonedDate={allocationModal.zonedDate}
          zonedTime={allocationModal.zonedTime}
          handleAllocation={handleAllocation}
        />
      )}
    </div>
  )
}

export default memo(ScheduleTab)
