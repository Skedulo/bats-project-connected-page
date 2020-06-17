import React, { useEffect, useState, useCallback, memo, useMemo, ChangeEvent, useContext } from 'react'
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
import ProjectFilter from './ProjectFilter'
import CreateProjectModal from './CreateProjectModal'
import LoadingTrigger from '../../commons/components/GlobalLoading/LoadingTrigger'
import { IProjectListItem, IListResponse, IProjectDetail, IFilterParams, ProjectStatusKey } from '../../commons/types'
import { DEFAULT_FILTER, DEFAULT_PROJECTS_LIST, PROJECT_STATUS_COLOR } from '../../commons/constants'
import { fetchListProjects, deleteProject, createProject, cancelProject } from '../../Services/DataServices'
import { projectDetailPath } from '../routes'
import { AppContext } from '../../App'
import SearchBox from '../../commons/components/SearchBox'
import { toastMessage } from '../../commons/utils'

interface IProjectsListProps {
  children?: any
}

const CONFIRM_ACTION = {
  CANCEL: 'cancel',
  DELETE: 'delete',
}

export const projectsTableColumns = (
  onViewProject: (projectId: string) => void,
  onCancelProject: (projectId: string) => void,
  onDeleteProject?: (projectId: string) => void
) => {
  return [
    {
      Header: 'Name',
      accessor: 'projectName',
      width: '20%',
    },
    {
      Header: 'Description',
      accessor: 'projectDescription',
      width: '30%',
    },
    {
      Header: 'Status',
      accessor: 'projectStatus',
      Cell: ({ cell }: { cell: { value: ProjectStatusKey } }) => {
        const color = PROJECT_STATUS_COLOR[cell.value] || 'neutral'

        return <Lozenge label={cell.value} color={color} size="small" solid={false} border={false} />
      },
    },
    {
      Header: 'Start',
      accessor: 'startDate',
      emptyCellText: 'No start date',
    },
    {
      Header: 'Finish',
      accessor: 'endDate',
      emptyCellText: 'No finish date',
    },
    {
      Header: '',
      accessor: 'id',
      disableSortBy: true,
      Cell: ({ cell, row }: { cell: { value: string }; row: { original: IProjectDetail } }) => {
        const actionItems = [{ label: 'View/Edit', onClick: () => onViewProject(cell.value) }]
        if (!row.original?.isTemplate && row.original?.projectStatus !== 'Cancelled') {
          actionItems.push({ label: 'Cancel', onClick: () => onCancelProject(cell.value) })
        }
        if (onDeleteProject) {
          actionItems.push({ label: 'Delete', onClick: () => onDeleteProject(cell.value) })
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

const ProjectsList: React.FC<IProjectsListProps> = () => {
  const history = useHistory()
  const appContext = useContext(AppContext)
  const { objPermissions } = useMemo(() => appContext?.config || {}, [appContext])

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)

  const [confirmId, setConfirmId] = useState<string | null>(null)

  const [filterParams, setFilterParams] = useState<IFilterParams>(DEFAULT_FILTER)

  const [projects, setProjects] = useState<IListResponse<IProjectListItem>>(DEFAULT_PROJECTS_LIST)

  const confirmAction = useMemo(() => confirmId?.split(',')[0], [confirmId])

  const getProjectsList = useCallback(async (params: IFilterParams) => {
    try {
      setIsLoading(true)
      const res = await fetchListProjects({ ...params })
      setProjects(res)
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debounceGetProjectList = useMemo(() => debounce(700, getProjectsList), [getProjectsList])

  const onRowSelect = useCallback((selectedRowIds: string[]) => {
    // console.log('selectedRowIds: ', selectedRowIds)
  }, [])

  const onPageChange = useCallback((page: number) => {
    setFilterParams((prev: IFilterParams) => ({ ...prev, pageNumber: page }))
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

  const toggleCreateModal = useCallback(() => {
    setOpenCreateModal((prev: boolean) => !prev)
  }, [])

  const openConfirmDelete = useCallback((projectId: string) => {
    setConfirmId(`${CONFIRM_ACTION.DELETE},${projectId}`)
  }, [])

  const openConfirmCancel = useCallback((projectId: string) => {
    setConfirmId(`${CONFIRM_ACTION.CANCEL},${projectId}`)
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmId(null)
  }, [])

  const onSaveProject = useCallback(async (data: IProjectDetail) => {
    try {
      setIsLoading(true)
      const res = await createProject(data)
      setProjects(res)
      setFilterParams(DEFAULT_FILTER)
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setOpenCreateModal(false)
      setIsLoading(false)
    }
  }, [])

  // TODO: made top url sync with cp url
  const onViewProject = useCallback((projectId: string) => {
    // window.top.window.location.href = `${PROJECT_DETAIL_PATH}${projectId}`
    history.push(projectDetailPath(projectId))
  }, [])

  const onCancelProject = useCallback(async () => {
    const projectId = confirmId?.split(',')[1]
    if (!projectId) {
      return
    }
    setIsLoading(true)
    const success = await cancelProject(projectId)
    if (success) {
      await getProjectsList(filterParams)
    } else {
      toastMessage.error('Cancelled unsuccessfully!')
    }
    setIsLoading(false)
    closeConfirm()
  }, [confirmId, filterParams])

  const onDeleteProject = useCallback(async () => {
    const projectId = confirmId?.split(',')[1]

    if (!projectId) {
      return
    }
    setIsLoading(true)
    const success = await deleteProject(projectId)
    if (success) {
      await getProjectsList(filterParams)
    } else {
      toastMessage.error('Deleted unsuccessfully!')
    }
    setIsLoading(false)
    closeConfirm()
  }, [confirmId, filterParams])

  const projectsTableConfig: IDynamicTable<IProjectListItem> = useMemo(
    () => ({
      data: projects.results,
      columns: projectsTableColumns(
        onViewProject,
        openConfirmCancel,
        objPermissions?.Project.allowDelete ? openConfirmDelete : undefined
      ),
      stickyHeader: false,
      getRowId: (row: IProjectListItem) => row.id,
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
    [projects.results, projectsTableColumns, objPermissions?.Project]
  )

  useEffect(() => {
    if (!isLoading) {
      debounceGetProjectList(filterParams)
    }
  }, [filterParams])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-px-4 cx-pt-4 cx-top-0 cx-bg-white cx-z-10">
        <div className="cx-flex cx-aligns-center cx-justify-between">
          <h1 className="cx-text-xl cx-font-semibold">Projects</h1>
          <ul className="cx-flex">
            <li className="cx-pr-4">
              <SearchBox
                className="cx-px-4 cx-py-0 cx-mb-0 cx-border"
                onChange={onSearchTextChange}
                placeholder="projects"
                clearable={!!filterParams.searchText}
                value={filterParams.searchText || ''}
                autoFocus={false}
              />
            </li>
            {objPermissions?.Project.allowCreate && (
              <li>
                <Button buttonType="primary" onClick={toggleCreateModal}>
                  Create new
                </Button>
              </li>
            )}
          </ul>
        </div>
        <ProjectFilter onResetFilter={onResetFilter} onFilterChange={onFilterChange} filterParams={filterParams} />
      </div>
      <div className="cx-p-4">
        <DynamicTable {...projectsTableConfig} />
        {projects.totalItems > 0 && (
          <Pagination
            itemsTotal={projects.totalItems}
            itemsPerPage={filterParams.pageSize || 0}
            currentPage={filterParams.pageNumber || 1}
            onPageChange={onPageChange}
            className="cx-static"
          />
        )}
      </div>
      {openCreateModal && <CreateProjectModal onClose={toggleCreateModal} onSubmit={onSaveProject} />}
      {!!confirmAction && (
        <ConfirmationModal
          onCancel={closeConfirm}
          onConfirm={confirmAction === CONFIRM_ACTION.DELETE ? onDeleteProject : onCancelProject}
          confirmButtonText="Ok"
        >
          {`Are you sure you want to ${confirmAction} this project?`}
        </ConfirmationModal>
      )}
    </div>
  )
}

export default memo(ProjectsList)
