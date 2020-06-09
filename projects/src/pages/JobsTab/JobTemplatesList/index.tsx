import React, { useEffect, useState, useCallback, memo, useMemo, useContext } from 'react'
import { debounce, uniq, keyBy, times } from 'lodash/fp'
import { DynamicTable, IDynamicTable, Lozenge, Pagination, Button, LozengeColors, Avatar } from '@skedulo/sked-ui'
import JobFilter from './JobTemplateFilter'
import LoadingTrigger from '../../../commons/components/GlobalLoading/LoadingTrigger'
import {
  IListResponse,
  IFilterParams,
  IJobFilterParams,
  JobStatusKey,
  IJobDetail,
  IJobTemplate,
  IJobTypeTemplate,
  IConfig,
  IJobConstraint,
} from '../../../commons/types'
import { DEFAULT_FILTER, DEFAULT_LIST, JOB_STATUS_COLOR } from '../../../commons/constants'
import { fetchListJobTemplates, createUpdateJobTemplate, fetchJobTypeTemplateValues } from '../../../Services/DataServices'
import SearchBox from '../../../commons/components/SearchBox'
import JobTemplateModal from '../JobTemplateModal'
import { AppContext } from '../../../App'
import { toastMessage } from '../../../commons/utils'

interface IJobTemplatesListProps {
  projectId: string
  isTemplate: boolean
}

const jobTemplatesTableColumns = (onViewJobTemplate: (job: IJobDetail) => void) => {
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
      accessor: 'jobConstraints',
      Cell: ({ cell }: { cell: { value: IJobConstraint[] } }) => {
        if (!cell.value?.length) {
          return 'No constraints'
        }
        const constraints = cell.value.map(item => {
          return `${item.constraintType} ${item.dependencyType.toLowerCase()} ${item.dependentJob?.name}`
        })
        return <div className="sk-flex sk-items-center">{constraints.join(' and ')}</div>
      },
    },
    {
      Header: 'Resource/s',
      accessor: 'resourceRequirement',
      Cell: ({ cell }: { cell: { value: number } }) => {
        const resources: React.ReactNode[] = []
        times((index: number) => {
          resources.push(
            <Avatar
              name={''}
              key={`resourcerquired-${index}`}
              className="cx-ml-1 first:cx-ml-0 cx-bg-blue-100 cx-border cx-border-dotted cx-border-blue-500"
              showTooltip={false}
              size="medium"
              preserveName={false}
            />
          )
        }, cell.value)
        return <div className="sk-flex sk-items-center">{resources}</div>
      },
    },
  ]
}

const JobTemplatesList: React.FC<IJobTemplatesListProps> = ({ projectId }) => {
  const appContext = useContext(AppContext)

  const { jobTypeTemplates = [], jobTypeTemplateValues = {} } = useMemo(() => appContext?.config || {}, [appContext])
  const setAppConfig = useMemo(() => appContext?.setAppConfig, [appContext])
  const jobTypeTemplateValueKeys = useMemo(() => Object.keys(jobTypeTemplateValues), [jobTypeTemplateValues])

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filterParams, setFilterParams] = useState<IJobFilterParams>(DEFAULT_FILTER)
  const [jobTemplates, setJobTemplates] = useState<IListResponse<IJobTemplate>>(DEFAULT_LIST)
  const [selectedJobTemplate, setSelectedJobTemplate] = useState<IJobTemplate | null>(null)
  const [openJobTemplateModal, setOpenJobTemplateModal] = useState<boolean>(false)

  const getJobTemplatesList = useCallback(
    async (params: IJobFilterParams) => {
      setIsLoading(true)
      const res = await fetchListJobTemplates({ ...params })
      if (res) {
        // get resource requirements
        const jobTypes = uniq(res.results.map((item: IJobTemplate) => item.jobType))
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
              return { ...prev, jobTypeTemplateValues: newJobTypeTemplateValues }
            })
          }
        }

        const jobsWithResourceRequirement =
          res.results.length > 0
            ? res.results.map((item: IJobTemplate) => {
                return {
                  ...item,
                  resourceRequirement: newJobTypeTemplateValues[item.jobType]
                    ? newJobTypeTemplateValues[item.jobType].totalQty
                    : 1,
                }
              })
            : []
        setJobTemplates({ ...res, results: jobsWithResourceRequirement })
      }
      setIsLoading(false)
    },
    [jobTypeTemplateValueKeys, jobTypeTemplateValues]
  )

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
    setSelectedJobTemplate(null)
  }, [])

  const onSaveJobTemplate = useCallback(async (data: IJobTemplate) => {
    setIsLoading(true)
    const success = await createUpdateJobTemplate({ ...data, projectId })
    if (success) {
      getJobTemplatesList({ ...filterParams, projectId })
    }  else {
      const errorMsg = data.id ? 'Edited unsuccessfully!' : 'Created unsuccessfully!'
      toastMessage.error(errorMsg)
    }
    onCloseJobTemplateModal()
    setIsLoading(false)
  }, [projectId, filterParams])

  const jobsTableConfig: IDynamicTable<IJobTemplate> = useMemo(
    () => ({
      data: jobTemplates.results,
      columns: jobTemplatesTableColumns(onViewJobTemplate),
      stickyHeader: false,
      rowSelectControl: 'disabled',
      onSortBy: props => {
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
      debounceGetJobTemplatesList({ ...filterParams, projectId })
    }
  }, [filterParams, projectId])

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
        <JobTemplateModal
          onSubmit={onSaveJobTemplate}
          onClose={onCloseJobTemplateModal}
          jobTemplate={selectedJobTemplate}
          projectId={projectId}
          totalJobTemplates={jobTemplates.totalItems}
        />
      )}
    </div>
  )
}

export default memo(JobTemplatesList)
