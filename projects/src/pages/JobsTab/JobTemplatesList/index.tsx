import React, { useEffect, useState, useCallback, memo, useMemo } from 'react'
import { debounce } from 'lodash/fp'
import { DynamicTable, IDynamicTable, Lozenge, Pagination, Button, LozengeColors } from '@skedulo/sked-ui'
import JobFilter from './JobTemplateFilter'
import LoadingTrigger from '../../../commons/components/GlobalLoading/LoadingTrigger'
import {
  IListResponse,
  IFilterParams,
  IJobFilterParams,
  JobStatusKey,
  IJobDetail,
  IJobTemplate,
} from '../../../commons/types'
import { DEFAULT_FILTER, DEFAULT_LIST, JOB_STATUS_COLOR } from '../../../commons/constants'
import { fetchListJobTemplates, updateJob, createJob } from '../../../Services/DataServices'
import SearchBox from '../../../commons/components/SearchBox'
import JobTemplateModal from '../JobModal'

interface IJobTemplatesListProps {
  projectId: string
  isTemplate: boolean
}

const jobTemplatesTableColumns = (onViewJobTemplate: (job: IJobTemplate) => void) => {
  return [
    {
      Header: 'Name/Description',
      accessor: 'name',
      width: '30%',
      Cell: ({ row }: { row: { original: IJobDetail } }) => {
        const onClickCell = () => onViewJobTemplate(row.original)
        return (
          <div className="hover:cx-cursor-pointer" onClick={onClickCell}>
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
      Header: 'Constrains',
      accessor: 'constraints',
    },
    {
      Header: 'Required Resources',
      accessor: 'requiredResources',
    },
  ]
}

const JobTemplatesList: React.FC<IJobTemplatesListProps> = ({ projectId, isTemplate }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filterParams, setFilterParams] = useState<IJobFilterParams>(DEFAULT_FILTER)
  const [jobTemplates, setJobTemplates] = useState<IListResponse<IJobTemplate>>(DEFAULT_LIST)
  const [selectedJobTemplate, setSelectedJobTemplate] = useState<IJobTemplate | null>(null)
  const [openJobTemplateModal, setOpenJobTemplateModal] = useState<boolean>(false)

  const getJobTemplatesList = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetchListJobTemplates({ projectId, ...filterParams })
      if (res) {
        setJobTemplates(res)
      }
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setIsLoading(false)
    }
  }, [filterParams, projectId, isTemplate])

  const debounceGetJobTemplatesList = useMemo(() => debounce(700, getJobTemplatesList), [getJobTemplatesList])

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

  const onViewJobTemplate = useCallback((job: IJobTemplate) => {
    // window.top.window.location.href = `${PROJECT_DETAIL_PATH}${projectId}`
    setSelectedJobTemplate(job)
    setOpenJobTemplateModal(true)
  }, [])

  const onCreateJobTemplate = useCallback(() => {
    setOpenJobTemplateModal(true)
  }, [])

  const onCloseJobTemplateModal = useCallback(() => {
    setOpenJobTemplateModal(false)
  }, [])

  const onSaveJob = useCallback(async (data: IJobTemplate) => {
    try {
      setIsLoading(true)
      console.log('submit----data: ', data)
      setFilterParams(DEFAULT_FILTER)
    } catch (error) {
      console.log('error: ', error)
    } finally {
      onCloseJobTemplateModal()
      setIsLoading(false)
    }
  }, [])

  const jobsTableConfig: IDynamicTable<IJobTemplate> = useMemo(
    () => ({
      data: jobTemplates.results,
      columns: jobTemplatesTableColumns(onViewJobTemplate),
      stickyHeader: false,
      rowSelectControl: 'disabled',
      onSortBy: (props) => {
        if (props?.id) {
          onFilterChange({ sortBy: props?.id, sortType: props?.desc ? 'DESC' : 'ASC' })
        }
      },
      sortByControl: 'controlled',
      initialRowStateKey: 'id',
    }),
    [jobTemplates.results, jobTemplatesTableColumns]
  )

  useEffect(() => {
    if (!isLoading) {
      console.log('filterParams: ', filterParams)
      debounceGetJobTemplatesList()
    }
  }, [filterParams])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-px-4 cx-pt-4 cx-top-0 cx-bg-white cx-z-10">
        <JobFilter onResetFilter={onResetFilter} onFilterChange={onFilterChange} filterParams={filterParams} />
        <div className="cx-flex cx-aligns-center cx-justify-between">
          <Button buttonType="transparent" onClick={onCreateJobTemplate} icon="plus">
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
        {jobTemplates.totalItems > 0 && (
          <Pagination
            itemsTotal={jobTemplates.totalItems}
            itemsPerPage={filterParams.pageSize || 0}
            currentPage={filterParams.pageNumber || 1}
            onPageChange={onPageChange}
            className="cx-static"
          />
        )}
      </div>
      {openJobTemplateModal && (
        <JobTemplateModal job={selectedJobTemplate} onSubmit={onSaveJob} onClose={onCloseJobTemplateModal} />
      )}
    </div>
  )
}

export default memo(JobTemplatesList)
