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
  IconButton,
  ConfirmationModal,
} from '@skedulo/sked-ui'
import { ProjectListItemInterface, ListResponseInterface, ProjectDetailInterface } from '../../commons/types'
import { DEFAULT_FILTER, DEFAULT_PROJECTS_LIST } from '../../commons/constants'
import { fetchListProjects } from '../../Services/DataServices'
import { IFilter } from '@skedulo/sked-ui/dist/components/filter-bar/interfaces'
import CreateProjectModal from './CreateProjectModal'
import LoadingTrigger from '../../commons/components/GlobalLoading/LoadingTrigger'
import { projectDetailPath } from '../routes';

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

const FILTER_BAR: IFilter<{ id: string; name: string }>[] = [
  {
    id: '1',
    name: 'Status',
    items: [
      { id: 'InProgress', name: 'In Progress' },
      { id: 'Template', name: 'Template' },
    ],
    selectedIds: [],
    inputType: 'checkbox',
  },
]

const ProjectsList: React.FC<ProjectsListProps> = () => {
  const history = useHistory()
  const [searchText, setSearchText] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false)
  const [filterParams, setFilterParams] = useState<FilterParamsInterface>(DEFAULT_FILTER)
  const [projects, setProjects] = useState<ListResponseInterface<ProjectListItemInterface>>(DEFAULT_PROJECTS_LIST)

  const getProjectsList = useCallback(async () => {
    setIsLoading(true)
    const res = await fetchListProjects({ ...filterParams, searchText })
    console.log('res: ', res)
    setProjects(res)
    setIsLoading(false)
  }, [])

  const debounceGetProjectList = useMemo(() => debounce(1000, getProjectsList), [getProjectsList])

  const onRowSelect = useCallback((selectedRowIds: string[]) => {
    console.log('selectedRowIds: ', selectedRowIds)
  }, [])

  const onPageChange = useCallback((page: number) => {
    setFilterParams((prev: FilterParamsInterface) => ({ ...prev, pageNumber: page }))
  }, [])

  const onSearchTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }, [])

  const onFilter = useCallback((params: any) => {
    console.log('fitlerrr:', params)
  }, [])

  const toggleCreateModal = useCallback(() => {
    setOpenCreateModal((prev: boolean) => !prev)
  }, [])

  const toggleConfirmDelele = useCallback(() => {
    setOpenConfirmDelete((prev: boolean) => !prev)
  }, [])

  const onSaveProject = useCallback((data: ProjectDetailInterface) => {
    console.log('saveProject: ', data)
  }, [])

  const onViewProject = useCallback((projectId: string) => {
    // window.top.window.location.href = `${PROJECT_DETAIL_PATH}${projectId}`
    history.push(projectDetailPath(projectId))
  }, [])

  const onDeleteProject = useCallback((projectId: string) => {
    toggleConfirmDelele()
    console.log('delete---project: ', projectId);
  }, [])

  const projectsTableConfig: IDynamicTable<ProjectListItemInterface> = useMemo(
    () => ({
      data: projects.results,
      columns: projectsTableColumns(onViewProject, onDeleteProject),
      stickyHeader: false,
      getRowId: (row: ProjectListItemInterface) => row.id,
      rowSelectControl: 'allRows',
      onRowSelect,
    }),
    [projects.results, projectsTableColumns]
  )

  useEffect(() => {
    if (!isLoading) {
      getProjectsList()
    }
  }, [filterParams])

  useEffect(() => {
    if (!isLoading) {
      debounceGetProjectList()
    }
  }, [searchText])

  return (
    <div className="page-view">
      {isLoading && <LoadingTrigger />}
      <h1 className="cx-text-xl cx-font-semibold">Projects</h1>
      <div className="top-bar">
        <div className="top-bar-left">
          <ul className="menu">
            <li className="list-view__title">
              <span>10 Accounts</span>
            </li>
            <li>
              <Button buttonType="secondary" compact={false} disabled={false} loading={false} icon={null}>
                All Projects
              </Button>
            </li>
            <li>
              <IconButton
                compact={false}
                tooltipContent="Save filter"
                disabled={false}
                icon="bookmark"
                buttonType="secondary"
              />
            </li>
            <li>
              <FilterBar scrollableContentClasses="sk-z-10" filters={FILTER_BAR} onFilter={onFilter} />
            </li>
          </ul>
        </div>
        <div className="top-bar-right top-bar-right--crud">
          <ul className="menu">
            <li className="padding-right">
              <div className="searchbox searchbox--small searchbox--w240">
                <i className="icon ski ski-search" />
                <input
                  type="text"
                  data-sk-name="generic-filter-bar"
                  placeholder="Search accounts"
                  value={searchText || ''}
                  onChange={onSearchTextChange}
                />
              </div>
            </li>
            <li>
              <Button buttonType="primary" onClick={toggleCreateModal}>
                Create new
              </Button>
            </li>
          </ul>
        </div>
      </div>
      <DynamicTable {...projectsTableConfig} />
      <Pagination
        itemsTotal={projects.totalItems}
        itemsPerPage={filterParams.pageSize}
        currentPage={filterParams.pageNumber}
        onPageChange={onPageChange}
      />
      {openCreateModal && <CreateProjectModal onClose={toggleCreateModal} onSubmit={onSaveProject} />}
      {openConfirmDelete && (
        <ConfirmationModal onCancel={toggleConfirmDelele} onConfirm={toggleConfirmDelele} confirmButtonText="Ok">
          Are you sure you want to delete this project?
        </ConfirmationModal>
      )}
    </div>
  )
}

export default memo(ProjectsList)
