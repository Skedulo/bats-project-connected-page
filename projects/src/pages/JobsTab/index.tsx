import React, { useEffect, useState, useCallback, memo, useMemo, ChangeEvent } from 'react'
import { debounce } from 'lodash/fp'
import { Dictionary } from 'lodash'
import {
  DynamicTable,
  IDynamicTable,
  Lozenge,
  Pagination,
  ActionMenu,
  Button,
  ConfirmationModal,
  Icon,
  LozengeColors,
  ButtonGroup,
} from '@skedulo/sked-ui'
import JobFilter from './JobFilter'
import JobModal from './JobModal'
import LoadingTrigger from '../../commons/components/GlobalLoading/LoadingTrigger'
import {
  IJobDetail,
  IListResponse,
  IFilterParams,
  IJobFilterParams,
  JobStatusKey,
  JobStatus,
} from '../../commons/types'
import { DEFAULT_FILTER, DEFAULT_LIST, JOB_STATUS_COLOR } from '../../commons/constants'
import { fetchListJobs, createJob, deleteJob, deallocateMutipleJobs, dispatchMutipleJobs } from '../../Services/DataServices'
import { AppContext } from '../../App'
import SearchBox from '../../commons/components/SearchBox'

interface IJobsListProps {
  projectId: string
}

const ID_LINKING_LETTER = '___'

const jobsTableColumns = (onDeleteJob?: (projectId: string) => void) => {
  return [
    {
      Header: 'Name/Description',
      accessor: 'name',
      width: '30%',
      Cell: ({ row }) => {
        return (
          <div>
            <h1>{row.original.name}</h1>
            <h2 className="cx-text-neutral-700">{row.original.description}</h2>
          </div>
        )
      },
    },
    {
      Header: 'Job type',
      accessor: 'jobType',
      width: '30%',
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ cell }: { cell: { value: JobStatusKey } }) => {
        const color: LozengeColors = JOB_STATUS_COLOR[cell.value] || 'neutral'
        return <Lozenge label={cell.value} color={color} size="small" solid={false} border={false} />
      },
    },
    {
      Header: 'Scheduled',
      accessor: 'startDate',
      emptyCellText: '-',
    },
    {
      Header: 'Constrains',
      accessor: 'constraints',
    },
    {
      Header: '',
      accessor: 'id',
      disableSortBy: true,
      Cell: ({ cell }: { cell: { value: string } }) => {
        const actionItems = []

        if (onDeleteJob) {
          actionItems.push({ label: 'Delete', onClick: () => onDeleteJob(cell.value) })
        }

        return (
          <div className="cx-text-right">
            <ActionMenu menuItems={actionItems} />
          </div>
        )
      },
    },
  ]
}

const JobsList: React.FC<IJobsListProps> = ({ projectId }) => {
  const appContext = React.useContext(AppContext)
  const { objPermissions } = React.useMemo(() => appContext?.config || {}, [appContext])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openJobModal, setOpenJobModal] = useState<boolean>(false)
  const [confirmDeleteId, setOpenConfirmDeleteId] = useState<string | null>(null)
  const [filterParams, setFilterParams] = useState<IJobFilterParams>(DEFAULT_FILTER)
  const [jobs, setJobs] = useState<IListResponse<IJobDetail>>(DEFAULT_LIST)
  const [selectedJob, setSelectedJob] = useState<IJobDetail | null>(null)
  const [selectedRows, setSelectedRows] = useState<IJobDetail[]>([])
  const [canDeallocate, setCanDeallocate] = useState<boolean>(true)
  const [canDispatch, setCanDispatch] = useState<boolean>(true)

  const getJobsList = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetchListJobs({ projectId, ...filterParams })
      console.log('res: ', res)
      if (res) {
        setJobs(res)
      }
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setIsLoading(false)
    }
  }, [filterParams, projectId])

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
    }, []
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

  const toggleJobModal = useCallback(() => {
    setOpenJobModal((prev: boolean) => !prev)
  }, [])

  const openConfirmDelete = useCallback((jobId: string) => {
    setOpenConfirmDeleteId(jobId)
  }, [])

  const closeConfirmDelete = useCallback(() => {
    setOpenConfirmDeleteId(null)
  }, [])

  const onSaveJob = useCallback(async (data: IJobDetail) => {
    try {
      setIsLoading(true)
      const res = await createJob(data)
      setJobs(res)
      setFilterParams(DEFAULT_FILTER)
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setOpenJobModal(false)
      setIsLoading(false)
    }
  }, [])

  const onViewJobDetail = useCallback((jobId: string) => {
    // window.top.window.location.href = `${PROJECT_DETAIL_PATH}${projectId}`
    console.log('jobId: ', jobId)
  }, [])

  const onDeleteJob = useCallback(async () => {
    if (!confirmDeleteId) {
      return
    }
    try {
      setIsLoading(true)
      await deleteJob(confirmDeleteId)
      await getJobsList()
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setIsLoading(false)
      closeConfirmDelete()
    }
  }, [confirmDeleteId])

  const onDispatchResource = useCallback(async () => {
    await dispatchMutipleJobs(selectedRows)
    // getJobsList()
  }, [selectedRows])

  const onDeallocate = useCallback(async () => {
    await deallocateMutipleJobs(selectedRows)
    // getJobsList()
  }, [selectedRows])

  const jobsTableConfig: IDynamicTable<IJobDetail> = useMemo(
    () => ({
      data: jobs.results,
      columns: jobsTableColumns(objPermissions?.Project.allowDelete ? openConfirmDelete : undefined),
      stickyHeader: false,
      getRowId: (row: IJobDetail, index) => row.id,
      rowSelectControl: 'allRows',
      onRowSelect,
      onSortBy: (props) => {
        if (props?.id) {
          onFilterChange({ sortBy: props?.id, sortType: props?.desc ? 'DESC' : 'ASC' })
        }
      },
      sortByControl: 'controlled',
      initialRowStateKey: 'id',
    }),
    [jobs.results, jobsTableColumns, objPermissions?.Project]
  )

  useEffect(() => {
    if (!isLoading) {
      console.log('filterParams: ', filterParams)
      debounceGetJobList()
    }
  }, [filterParams])

  useEffect(() => {
    let shouldDeallocation = false
    let shouldDispatch = true
    selectedRows.forEach((job) => {
      if (job.allocations?.length > 0) {
        shouldDeallocation = true
      }
      if (job.status !== JobStatus.PendingDispatch) {
        shouldDispatch = false
      }
    })
    setCanDeallocate(shouldDeallocation)
    setCanDispatch(shouldDispatch)
  }, [selectedRows])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-px-4 cx-pt-4 cx-top-0 cx-bg-white cx-z-10">
        <JobFilter onResetFilter={onResetFilter} onFilterChange={onFilterChange} filterParams={filterParams} />
        <div className="cx-flex cx-aligns-center cx-justify-between">
          <Button buttonType="transparent" onClick={toggleJobModal} icon="plus">
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
              className="searchbox searchbox--w240 cx-mb-0 cx-border"
              onChange={onSearchTextChange}
              placeholder="jobs"
              clearable={!!filterParams.searchText}
              value={filterParams.searchText}
              autoFocus={false}
            />
          </div>
        </div>
      </div>
      <div className="cx-p-4">
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
      {openJobModal && <JobModal job={selectedJob} onClose={toggleJobModal} onSubmit={onSaveJob} />}
      {!!confirmDeleteId && (
        <ConfirmationModal onCancel={closeConfirmDelete} onConfirm={onDeleteJob} confirmButtonText="Ok">
          Are you sure you want to delete this job?
        </ConfirmationModal>
      )}
    </div>
  )
}

export default memo(JobsList)
