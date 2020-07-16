import React, { useEffect, useState, useCallback, memo, useMemo } from 'react'
import { debounce, uniq, keyBy, times, toNumber } from 'lodash/fp'
import { Dictionary } from 'lodash'
import {
  DynamicTable,
  IDynamicTable,
  Lozenge,
  Pagination,
  Button,
  LozengeColors,
  ButtonGroup,
  Avatar,
} from '@skedulo/sked-ui'
import JobFilter from './JobFilter'
import LoadingTrigger from '../../../commons/components/GlobalLoading/LoadingTrigger'
import {
  IJobDetail,
  IListResponse,
  IFilterParams,
  IJobFilterParams,
  JobStatusKey,
  IJobTypeTemplate,
  IConfig,
  IProjectDetail,
} from '../../../commons/types'
import { DEFAULT_FILTER, DEFAULT_LIST, JOB_STATUS_COLOR } from '../../../commons/constants'
import {
  fetchListJobs,
  deallocateMutipleJobs,
  dispatchMutipleJobs,
  fetchJobTypeTemplateValues,
} from '../../../Services/DataServices'
import { AppContext } from '../../../App'
import SearchBox from '../../../commons/components/SearchBox'
import { createJobPath, jobDetailPath } from '../../routes'
import { toastMessage } from '../../../commons/utils'

interface IJobsListProps {
  project: IProjectDetail
}

const jobsTableColumns = (onViewJobDetail: (jobId: string) => void) => {
  return [
    {
      Header: 'Name/Description',
      accessor: 'name',
      width: '30%',
      Cell: ({ row }: { row: { original: IJobDetail } }) => {
        const onCellClick = () => onViewJobDetail(row.original.id)
        return (
          <div onClick={onCellClick} className="hover:cx-cursor-pointer">
            <h1 className="hover:cx-text-primary cx-font-medium">{row.original.name}</h1>
            <h2 className="cx-text-neutral-700">{row.original.description}</h2>
          </div>
        )
      },
    },
    {
      Header: 'Job type',
      accessor: 'jobType',
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ cell }: { cell: { value: JobStatusKey } }) => {
        const color = JOB_STATUS_COLOR[cell.value] || 'neutral'
        return <Lozenge label={cell.value} color={color} size="small" solid={false} border={false} />
      },
    },
    {
      Header: 'Scheduled Date/Time',
      accessor: 'startDate',
      Cell: ({ row }: { row: { original: IJobDetail } }) => {
        return (
          <div>
            <h1>{row.original.startDate}</h1>
            <h2 className="cx-text-neutral-700">{row.original.startTimeString}</h2>
          </div>
        )
      },
    },
    {
      Header: 'Resource/s',
      accessor: 'resourceRequirement',
      Cell: ({ row }: { row: { original: IJobDetail } }) => {
        const resources: React.ReactNode[] = []
        const time = Math.max(row.original.allocations?.length || 0, toNumber(row.original.resourceRequirement))
        times(index => {
          const jobAllocation = row.original.allocations ? row.original.allocations[index] : null
          const className = jobAllocation ? 'cx-ml-1 first:cx-ml-0' : 'cx-ml-1 first:cx-ml-0 cx-bg-blue-100 cx-border cx-border-dotted cx-border-blue-500'
          resources.push(
            <Avatar
              name={jobAllocation?.resource?.name || ''}
              key={`resourcerquired-${index}`}
              className={className}
              showTooltip={!!jobAllocation?.resource?.name}
              size="small"
              preserveName={false}
            />
          )
        }, time > 0 ? time : 1)
        return (
          <div className="sk-flex sk-items-center">
            {resources}
          </div>
        )
      }
    }
  ]
}

const ALLOWED_DEALLOCATE_STATUS = ['Dispatched', 'Pending Dispatch']
const ALLOWED_DISPATCH_STATUS = ['Pending Dispatch']

const JobsList: React.FC<IJobsListProps> = ({ project }) => {
  const projectId = project.id
  const appContext = React.useContext(AppContext)
  const { jobTypeTemplates = [], jobTypeTemplateValues = {} } = React.useMemo(() => appContext?.config || {}, [
    appContext,
  ])
  const setAppConfig = React.useMemo(() => appContext?.setAppConfig, [appContext])
  const jobTypeTemplateValueKeys = React.useMemo(() => Object.keys(jobTypeTemplateValues), [jobTypeTemplateValues])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filterParams, setFilterParams] = useState<IJobFilterParams>(DEFAULT_FILTER)
  const [jobs, setJobs] = useState<IListResponse<IJobDetail>>(DEFAULT_LIST)
  const [selectedRows, setSelectedRows] = useState<IJobDetail[]>([])
  const [canDeallocate, setCanDeallocate] = useState<boolean>(true)
  const [canDispatch, setCanDispatch] = useState<boolean>(true)

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

  const onRowSelect = useCallback(
    (rowIds: string[], isAllRowsSelected: boolean | undefined, rowData: Dictionary<IJobDetail> | undefined) => {
      const selectedItems: IJobDetail[] = []
      rowIds.forEach((id: string) => {
        if (rowData && rowData[id]) {
          selectedItems.push(rowData[id])
        }
      })
      setSelectedRows(selectedItems)
    },
    []
  )

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
    let preFillStr = `form.ProjectId=${projectId}`
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
  }, [project, projectId])

  const onViewJobDetail = useCallback((jobId: string) => {
    window.top.window.location.href = jobDetailPath(jobId)
  }, [])

  const onDispatchResource = useCallback(async () => {
    const jobIds = selectedRows.filter(job => ALLOWED_DISPATCH_STATUS.includes(job.status)).map(job => job.id).join(',')
    const success = await dispatchMutipleJobs(jobIds)
    if (success) {
      getJobsList({ ...filterParams, projectId })
      toastMessage.success('Dispatched successfully!')
    } else {
      toastMessage.success('Dispatched unsuccessfully!')
    }
  }, [selectedRows, filterParams, projectId])

  const onDeallocate = useCallback(async () => {
    const jobIds = selectedRows
      .filter(job => ALLOWED_DEALLOCATE_STATUS.includes(job.status))
      .map(job => job.id).join(',')
    const success = await deallocateMutipleJobs(jobIds)
    if (success) {
      getJobsList({ ...filterParams, projectId })
      toastMessage.success('Deallocated successfully!')
    } else {
      toastMessage.success('Deallocated unsuccessfully!')
    }
  }, [selectedRows, filterParams, projectId])

  const jobsTableConfig: IDynamicTable<IJobDetail> = useMemo(
    () => ({
      data: jobs.results,
      columns: jobsTableColumns(onViewJobDetail),
      stickyHeader: false,
      getRowId: (row: IJobDetail, index) => row.id,
      rowSelectControl: 'allRows',
      onRowSelect,
      onSortBy: props => {
        if (props?.id) {
          onFilterChange({ sortBy: props?.id, sortType: props?.desc ? 'DESC' : 'ASC' })
        }
      },
      sortByControl: 'controlled',
      initialRowStateKey: 'id',
    }),
    [jobs.results, jobsTableColumns]
  )

  useEffect(() => {
    if (!isLoading) {
      debounceGetJobList({...filterParams, projectId})
    }
  }, [filterParams, projectId])

  useEffect(() => {
    let shouldDeallocation = true
    let shouldDispatch = true
    if (selectedRows.length === 1) {
      shouldDeallocation = ALLOWED_DEALLOCATE_STATUS.includes(selectedRows[0].status) &&
        selectedRows[0].allocations?.length > 0
      shouldDispatch = ALLOWED_DISPATCH_STATUS.includes(selectedRows[0].status)
    } else {
      shouldDeallocation = !!selectedRows.find(
        (job: IJobDetail) => job.allocations?.length > 0 && ALLOWED_DEALLOCATE_STATUS.includes(job.status)
      )
      shouldDispatch = !!selectedRows.find((job: IJobDetail) => ALLOWED_DISPATCH_STATUS.includes(job.status))
    }

    setCanDeallocate(shouldDeallocation)
    setCanDispatch(shouldDispatch)
  }, [selectedRows])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-p-2 cx-top-0 cx-bg-white cx-z-10">
        <JobFilter onResetFilter={onResetFilter} onFilterChange={onFilterChange} filterParams={filterParams} />
        <div className="cx-flex cx-aligns-center cx-justify-between">
          <Button buttonType="transparent" onClick={onCreateJob} icon="plus">
            New Job
          </Button>
          <div className="cx-flex cx-aligns-center">
            {selectedRows.length > 0 && (
              <ButtonGroup className="cx-mr-2">
                <Button buttonType="secondary" disabled={!canDeallocate} onClick={onDeallocate}>
                  Deallocate
                </Button>
                <Button buttonType="primary" disabled={!canDispatch} onClick={onDispatchResource}>
                  Dispatch
                </Button>
              </ButtonGroup>
            )}
            <SearchBox
              className="searchbox searchbox--w240 cx-mb-0 cx-border cx-mr-2"
              onChange={onSearchTextChange}
              placeholder="jobs"
              clearable={!!filterParams.searchText}
              value={filterParams.searchText}
              autoFocus={false}
            />
          </div>
        </div>
      </div>
      <DynamicTable {...jobsTableConfig} />
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
  )
}

export default memo(JobsList)
