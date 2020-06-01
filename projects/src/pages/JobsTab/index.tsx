import React, { useEffect, useState, useCallback, memo, useMemo, ChangeEvent } from 'react'
import { debounce } from 'lodash/fp'
import { useHistory } from 'react-router-dom'
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
} from '@skedulo/sked-ui'
import JobFilter from './JobFilter'
import JobModal from './JobModal'
import LoadingTrigger from '../../commons/components/GlobalLoading/LoadingTrigger'
import { IJobDetail, IListResponse, IFilterParams, IJobFilterParams, JobStatusKey, JobStatus } from '../../commons/types'
import { DEFAULT_FILTER, DEFAULT_LIST } from '../../commons/constants'
import { fetchListJobs, createJob, deleteJob } from '../../Services/DataServices'
import { AppContext } from '../../App'
import SearchBox from '../../commons/components/SearchBox'
import { JOB_STATUS_COLOR } from '../../commons/constants/job';

interface IJobsListProps {
  projectId: string
}

const jobsTableColumns = (onDeleteJob?: (projectId: string) => void) => {
  return [
    {
      Header: 'Name/Description',
      accessor: 'name',
      width: '30%',
      Cell: (rows) => {
        console.log('rows: ', rows)
        return (
          <div>
            <h1>Job Name</h1>
            <h2>Job Description</h2>
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
      accessor: 'jobStatus',
      Cell: ({ cell }: { cell: { value: JobStatus } }) => {
        const color: LozengeColors = JOB_STATUS_COLOR[value] || 'neutral'
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
  const history = useHistory()
  const appContext = React.useContext(AppContext)
  const { objPermissions } = React.useMemo(() => appContext?.config || {}, [appContext])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openJobModal, setOpenJobModal] = useState<boolean>(false)
  const [confirmDeleteId, setOpenConfirmDeleteId] = useState<string | null>(null)
  const [filterParams, setFilterParams] = useState<IJobFilterParams>(DEFAULT_FILTER)
  const [jobs, setJobs] = useState<IListResponse<IJobDetail>>(DEFAULT_LIST)
  const [selectedJob, setSelectedJob] = useState<IJobDetail | null>(null)

  const getJobsList = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetchListJobs({ projectId, ...filterParams })
      console.log('res: ', res);
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

  const onRowSelect = useCallback((selectedRowIds: string[]) => {
    // console.log('selectedRowIds: ', selectedRowIds)
  }, [])

  const onPageChange = useCallback((page: number) => {
    setFilterParams((prev: IJobFilterParams) => ({ ...prev, pageNumber: page }))
  }, [])

  // const onSearchTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
  //   onFilterChange({ searchText: e.target.value })
  // }, [])
  const onSearchTextChange = useCallback((value: string) => {
    console.log('value: ', value)
    onFilterChange({ searchText: value })
  }, [])

  const onSearchTextClear = useCallback(() => {
    onFilterChange({ searchText: '' })
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

  const jobsTableConfig: IDynamicTable<IJobDetail> = useMemo(
    () => ({
      data: jobs.results,
      columns: jobsTableColumns(objPermissions?.Project.allowDelete ? openConfirmDelete : undefined),
      stickyHeader: false,
      getRowId: (row: IJobDetail) => row.id,
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
      // debounceGetJobList()
    }
  }, [filterParams])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-px-4 cx-pt-4 cx-top-0 cx-bg-white cx-z-10">
        <JobFilter onResetFilter={onResetFilter} onFilterChange={onFilterChange} filterParams={filterParams} />
        <div className="cx-flex cx-aligns-center cx-justify-between">
          <Button buttonType="transparent" onClick={toggleJobModal} icon="plus">
            New Job
          </Button>
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
