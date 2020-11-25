import React, { useEffect, useState, useCallback, memo, useMemo, useContext } from 'react'
import { debounce, uniq, keyBy } from 'lodash/fp'
import { DynamicTable, IDynamicTable, Pagination, Button, GroupAvatars, ActionMenu, ConfirmationModal } from '@skedulo/sked-ui'
import JobFilter from './JobTemplateFilter'
import LoadingTrigger from '../../../commons/components/GlobalLoading/LoadingTrigger'
import {
  IListResponse,
  IFilterParams,
  IJobFilterParams,
  IJobTemplate,
  IJobTypeTemplate,
  IConfig,
  IProjectDetail,
  IJobDependency,
} from '../../../commons/types'
import { DEFAULT_FILTER, DEFAULT_LIST } from '../../../commons/constants'
import { fetchListJobTemplates, createUpdateJobTemplate, fetchJobTypeTemplateValues, deleteJobTemplate } from '../../../Services/DataServices'
import SearchBox from '../../../commons/components/SearchBox'
import JobTemplateModal from '../../../commons/components/JobTemplateModal'
import JobDependencyModal from '../../../commons/components/JobDependencyModal'
import { AppContext } from '../../../App'
import { toastMessage, getDependencyType, parseMinutes } from '../../../commons/utils'

interface IJobTemplatesListProps {
  project: IProjectDetail
  isTemplate: boolean
}

const jobTemplatesTableColumns = (
  onViewJobTemplate: (job: IJobTemplate) => void,
  onDeleteJobTemplate: (id: string) => void,
  onOpenDependencyModal: (dependency: IJobDependency) => void
) => {
  return [
    {
      Header: 'Name/Description',
      accessor: 'name',
      width: '30%',
      Cell: ({ row }: { row: { original: IJobTemplate } }) => {
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
      Header: 'Dependencies',
      accessor: 'projectId',
      Cell: ({ row }: { row: { original: IJobTemplate } }) => {
        const onCreateDependency = () => onOpenDependencyModal({
          projectJobTemplateId: row.original.id || '',
          fromAnchor: 'Start',
          toAnchor: 'End'
        })
        const fromDependencies = row.original.fromProjectJobDependencies?.map(item => {
          const onUpdateDependency = () => onOpenDependencyModal(item)
          const dependencyType = getDependencyType(item)
          const minOffset = item.toAnchorMinOffsetMins ? `${parseMinutes(item.toAnchorMinOffsetMins, 'hours')} hours` : ''
          const maxOffset = item.toAnchorMaxOffsetMins ? `${parseMinutes(item.toAnchorMaxOffsetMins, 'hours')} hours` : ''
          const offsets = []
          if (minOffset) {
            offsets.push(minOffset)
          }
          if (maxOffset) {
            offsets.push(maxOffset)
          }
          const strings = offsets.length > 0 ? `${offsets.length > 1 ? offsets.join(' and ') : offsets[0]} after the end of` : ''

          return (
            <div
              className="cx-cursor-pointer hover:cx-bg-neutral-300 cx-p-2"
              key={item.id}
              onClick={onUpdateDependency}
            >
              {`${item.toJobTemplate?.name} must start ${dependencyType} ${strings} this job`}
            </div>
          )
        })
        const toDependencies = row.original.toProjectJobDependencies?.map(item => {
          const onUpdateDependency = () => onOpenDependencyModal(item)
          const dependencyType = getDependencyType(item)
          const minOffset = item.toAnchorMinOffsetMins ? `${parseMinutes(item.toAnchorMinOffsetMins, 'hours')} hours` : ''
          const maxOffset = item.toAnchorMaxOffsetMins ? `${parseMinutes(item.toAnchorMaxOffsetMins, 'hours')} hours` : ''
          const offsets = []
          if (minOffset) {
            offsets.push(minOffset)
          }
          if (maxOffset) {
            offsets.push(maxOffset)
          }
          const strings = offsets.length > 0 ? `${offsets.length > 1 ? offsets.join(' and ') : offsets[0]} after the end of` : ''
          return (
            <div
              className="cx-cursor-pointer hover:cx-bg-neutral-300 cx-p-2"
              key={item.id}
              onClick={onUpdateDependency}
            >
              {`Must start ${dependencyType} ${strings} job ${item.fromJobTemplate?.name}`}
            </div>
          )
        })
        return (
          <div className="cx-flex cx-items-start cx-flex-col">
            {fromDependencies}
            {toDependencies}
            <Button buttonType="transparent" onClick={onCreateDependency} icon="plus" className="cx-text-xs cx-text-neutral-700">
              {(fromDependencies?.length || toDependencies?.length) ? 'Add another dependency' : 'Add dependency'}
            </Button>
          </div>
        )
      },
    },
    {
      Header: 'Resource/s',
      accessor: 'resourceRequirement',
      Cell: ({ cell, row }: { cell: { value: number }, row: { original: IJobTemplate } }) => {
        const avatarInfo = row.original.resource ?
          [{ name: row.original.resource.name, tooltipText: row.original.resource.name }] :
          []
        return (
          <GroupAvatars
            totalSlots={cell.value}
            avatarInfo={avatarInfo}
            maxVisibleSlots={5}
          />
        )
      },
    },
    {
      Header: '',
      accessor: 'id',
      disableSortBy: true,
      Cell: ({ cell, row }: { cell: { value: string }; row: { original: IJobTemplate } }) => {
        const actionItems = [
          { label: 'View/Edit', onClick: () => onViewJobTemplate(row.original) },
        ]

        if (onDeleteJobTemplate) {
          actionItems.push({ label: 'Delete', onClick: () => onDeleteJobTemplate(cell.value) })
        }

        return (
          <div className="cx-text-right">
            <ActionMenu menuItems={actionItems} />
          </div>
        )
      },
    }
  ]
}

const JobTemplatesList: React.FC<IJobTemplatesListProps> = ({ project }) => {
  const { id: projectId, region } = project
  const appContext = useContext(AppContext)

  const { jobTypeTemplates = [], jobTypeTemplateValues = {} } = useMemo(() => appContext?.config || {}, [appContext])

  const setAppConfig = useMemo(() => appContext?.setAppConfig, [appContext])

  const jobTypeTemplateValueKeys = useMemo(() => Object.keys(jobTypeTemplateValues), [jobTypeTemplateValues])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [filterParams, setFilterParams] = useState<IJobFilterParams>(DEFAULT_FILTER)

  const [jobTemplates, setJobTemplates] = useState<IListResponse<IJobTemplate>>(DEFAULT_LIST)

  const [selectedJobTemplate, setSelectedJobTemplate] = useState<IJobTemplate | null>(null)

  const [selectedJobDependency, setSelectedJobDependency] = useState<IJobDependency | null>(null)

  const [confirmJobTemplateId, setConfirmJobTemplateId] = useState<string | null>(null)

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
    setSelectedJobTemplate(job)
    setOpenJobTemplateModal(true)
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmJobTemplateId(null)
  }, [])

  const onConfirmDelete = useCallback((jobId: string) => {
    setConfirmJobTemplateId(jobId)
  }, [])

  const onDeleteJobTemplate = useCallback(async () => {
    if (!confirmJobTemplateId) {
      return
    }
    setIsLoading(true)
    const success = await deleteJobTemplate(confirmJobTemplateId)
    if (success) {
      getJobTemplatesList({ ...filterParams, projectId })
    }  else {
      const errorMsg = 'Delete unsuccessfully!'
      toastMessage.error(errorMsg)
    }
    setConfirmJobTemplateId(null)
    onCloseJobTemplateModal()
    setIsLoading(false)
  }, [confirmJobTemplateId, filterParams, projectId])

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

  const onOpenDependencyModal = useCallback((jobDependency: IJobDependency) => {
    setSelectedJobDependency(jobDependency)
  }, [])

  const onCloseDependencyModal = useCallback(() => {
    setSelectedJobDependency(null)
  }, [])

  const jobsTableConfig: IDynamicTable<IJobTemplate> = useMemo(
    () => ({
      data: jobTemplates.results,
      columns: jobTemplatesTableColumns(onViewJobTemplate, onConfirmDelete, onOpenDependencyModal),
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

  const forceUpdateJobTemplateList = useCallback(() => {
    getJobTemplatesList({ ...filterParams, projectId })
  }, [filterParams, projectId])

  useEffect(() => {
    if (!isLoading) {
      debounceGetJobTemplatesList({ ...filterParams, projectId })
    }
  }, [filterParams, projectId])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-p-2 cx-bg-white cx-z-10">
        <JobFilter
          onResetFilter={onResetFilter}
          onFilterChange={onFilterChange}
          filterParams={{ ...filterParams, projectId }}
        />
        <div className="cx-flex cx-aligns-center cx-justify-between">
          <Button buttonType="transparent" onClick={onCreateJobTemplate} icon="plus">
            New Job
          </Button>
          <SearchBox
            className="cx-px-4 cx-py-0 cx-mb-0 cx-border cx-mr-2"
            onChange={onSearchTextChange}
            placeholder="jobs"
            clearable={!!filterParams.searchText}
            value={filterParams.searchText}
            autoFocus={false}
          />
        </div>
      </div>
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
      {openJobTemplateModal && (
        <JobTemplateModal
          onSubmit={onSaveJobTemplate}
          onClose={onCloseJobTemplateModal}
          jobTemplate={selectedJobTemplate}
          projectId={projectId}
          projectRegionId={region?.id || ''}
          totalJobTemplates={jobTemplates.totalItems}
          onDelete={onConfirmDelete}
        />
      )}
      {selectedJobDependency && (
        <JobDependencyModal
          jobDependency={selectedJobDependency}
          onClose={onCloseDependencyModal}
          projectId={projectId}
          forceUpdateJobTemplateList={forceUpdateJobTemplateList}
        />
      )}
      {!!confirmJobTemplateId && (
        <ConfirmationModal
          onCancel={closeConfirm}
          onConfirm={onDeleteJobTemplate}
          confirmButtonText="Ok"
        >
          {`Are you sure you want to delete this job template?`}
        </ConfirmationModal>
      )}
    </div>
  )
}

export default memo(JobTemplatesList)
