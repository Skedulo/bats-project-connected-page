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
  FilterBar,
  ConfirmationModal,
  Icon,
  PopOut,
  Datepicker,
  IconButton,
  Menu,
  MenuItem,
} from '@skedulo/sked-ui'
import { ProjectListItemInterface, ListResponseInterface, ProjectDetailInterface } from '../../commons/types'
import { DEFAULT_FILTER, DEFAULT_PROJECTS_LIST, DATE_FORMAT } from '../../commons/constants'
import { fetchListProjects, deleteProject, createProject } from '../../Services/DataServices'
import CreateProjectModal from './CreateProjectModal'
import LoadingTrigger from '../../commons/components/GlobalLoading/LoadingTrigger'
import { projectDetailPath } from '../routes'
import { useProjectFilter } from './useProjectFilter'
import { format, add } from 'date-fns'
import ProjectFilter from './ProjectFilter'

interface ProjectsListProps {
  children?: any
}

interface FilterParamsInterface {
  projectStatus?: string
  searchText?: string
  startDate?: string
  endDate?: string
  pageNumber?: number
  pageSize?: number
  sortType?: string
  sortBy?: string
  managerIds?: string
  accountIds?: string
  locationIds?: string
}

export const projectsTableColumns = (
  onViewProject: (projectId: string) => void,
  onDeleteProject: (projectId: string) => void
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
      Cell: ({ cell }) => {
        return <Lozenge label={cell.value} color="neutral" size="small" solid={false} border={false} icon={null} />
      },
    },
    {
      Header: 'Start',
      accessor: 'startDate',
    },
    {
      Header: 'Finish',
      accessor: 'endDate',
    },
    {
      Header: '',
      accessor: 'id',
      Cell: ({ cell }) => {
        return (
          <div className="cx-text-right">
            <ActionMenu
              menuItems={[
                {
                  label: 'View/Edit',
                  onClick: () => onViewProject(cell.value),
                },
                {
                  label: 'Delete',
                  onClick: () => onDeleteProject(cell.value),
                },
              ]}
            />
          </div>
        )
      },
    },
  ]
}

const ProjectsList: React.FC<ProjectsListProps> = () => {
  const history = useHistory()
  const [searchText, setSearchText] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
  const [confirmDeleteId, setOpenConfirmDeleteId] = useState<string | null>(null)
  const [filterParams, setFilterParams] = useState<FilterParamsInterface>(DEFAULT_FILTER)
  const [projects, setProjects] = useState<ListResponseInterface<ProjectListItemInterface>>(DEFAULT_PROJECTS_LIST)

  const getProjectsList = useCallback(async () => {
    setIsLoading(true)
    const res = await fetchListProjects({ ...filterParams, searchText })
    setProjects(res)
    setIsLoading(false)
  }, [filterParams, searchText])

  const debounceGetProjectList = useMemo(() => debounce(700, getProjectsList), [getProjectsList])

  const onRowSelect = useCallback((selectedRowIds: string[]) => {
    // console.log('selectedRowIds: ', selectedRowIds)
  }, [])

  const onPageChange = useCallback((page: number) => {
    setFilterParams((prev: FilterParamsInterface) => ({ ...prev, pageNumber: page }))
  }, [])

  const onSearchTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }, [])

  const onSearchTextClear = useCallback(() => {
    setSearchText('')
  }, [])

  const onResetFilter = useCallback(() => {
    setFilterParams(DEFAULT_FILTER)
    setSearchText('')
  }, [])

  const onFilterChange = useCallback((params: FilterParamsInterface) => {
    setFilterParams((prev: FilterParamsInterface) => ({ ...prev, ...params }))
  }, [])

  const toggleCreateModal = useCallback(() => {
    setOpenCreateModal((prev: boolean) => !prev)
  }, [])

  const openConfirmDelete = useCallback((projectId: string) => {
    setOpenConfirmDeleteId(projectId)
  }, [])

  const closeConfirmDelete = useCallback(() => {
    setOpenConfirmDeleteId(null)
  }, [])

  const onSaveProject = useCallback(async (data: ProjectDetailInterface) => {
    const res = await createProject(data)
  }, [])

  // TODO: made top url sync with cp url
  const onViewProject = useCallback((projectId: string) => {
    // window.top.window.location.href = `${PROJECT_DETAIL_PATH}${projectId}`
    history.push(projectDetailPath(projectId))
  }, [])

  const onDeleteProject = useCallback(async () => {
    if (!confirmDeleteId) {
      return
    }
    setIsLoading(true)
    await deleteProject(confirmDeleteId)
    setIsLoading(false)
    closeConfirmDelete()
    getProjectsList()
  }, [confirmDeleteId])

  const projectsTableConfig: IDynamicTable<ProjectListItemInterface> = useMemo(() => ({
    data: projects.results,
    columns: projectsTableColumns(onViewProject, openConfirmDelete),
    stickyHeader: false,
    getRowId: (row: ProjectListItemInterface) => row.id,
    rowSelectControl: 'allRows',
    onRowSelect,
  }), [projects.results, projectsTableColumns])

  useEffect(() => {
    if (!isLoading) {
      debounceGetProjectList()
    }
  }, [searchText, filterParams])

  return (
    <div className="page-view">
      {isLoading && <LoadingTrigger />}
      <div className="cx-flex cx-aligns-center cx-justify-between">
        <h1 className="cx-text-xl cx-font-semibold">Projects</h1>
        <ul className="menu">
          <li className="padding-right">
            <div className="searchbox searchbox--w240 cx-mb-0">
              <i className="icon ski ski-search" />
              <input
                type="text"
                data-sk-name="generic-filter-bar"
                placeholder="Search accounts"
                value={searchText || ''}
                onChange={onSearchTextChange}
              />
              {searchText && (
                <Icon className="cx-pr-2" size={18} color="#4A556A" onClick={onSearchTextClear} name="close" />
              )}
            </div>
          </li>
          <li>
            <Button buttonType="primary" onClick={toggleCreateModal}>
              Create new
            </Button>
          </li>
        </ul>
      </div>
      <ProjectFilter onResetFilter={onResetFilter} onFilterChange={onFilterChange} filterParams={filterParams} />
      <DynamicTable {...projectsTableConfig} />
      <Pagination
        itemsTotal={projects.totalItems}
        itemsPerPage={filterParams.pageSize || 0}
        currentPage={filterParams.pageNumber || 1}
        onPageChange={onPageChange}
      />
      {openCreateModal && <CreateProjectModal onClose={toggleCreateModal} onSubmit={onSaveProject} />}
      {!!confirmDeleteId && (
        <ConfirmationModal onCancel={closeConfirmDelete} onConfirm={onDeleteProject} confirmButtonText="Ok">
          Are you sure you want to delete this project?
        </ConfirmationModal>
      )}
    </div>
  )
}

export default memo(ProjectsList)
