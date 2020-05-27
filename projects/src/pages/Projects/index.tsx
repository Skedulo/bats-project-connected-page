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
} from '@skedulo/sked-ui'
import ProjectFilter from './ProjectFilter'
import CreateProjectModal from './CreateProjectModal'
import LoadingTrigger from '../../commons/components/GlobalLoading/LoadingTrigger'
import { ProjectListItemInterface, ListResponseInterface, ProjectDetailInterface, FilterParamsInterface } from '../../commons/types'
import { DEFAULT_FILTER, DEFAULT_PROJECTS_LIST } from '../../commons/constants'
import { fetchListProjects, deleteProject, createProject } from '../../Services/DataServices'
import { projectDetailPath } from '../routes'
import { AppContext } from '../../App';

interface ProjectsListProps {
  children?: any
}

export const projectsTableColumns = (
  onViewProject: (projectId: string) => void,
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
      Cell: ({ cell }: { cell: { value: string }}) => {
        return <Lozenge label={cell.value} color="neutral" size="small" solid={false} border={false} />
      },
    },
    {
      Header: 'Start',
      accessor: 'startDate',
      emptyCellText: 'No start date'
    },
    {
      Header: 'Finish',
      accessor: 'endDate',
      emptyCellText: 'No finish date'
    },
    {
      Header: '',
      accessor: 'id',
      disableSortBy: true,
      Cell: ({ cell }: { cell: { value: string }}) => {
        const actionItems = [{ label: 'View/Edit', onClick: () => onViewProject(cell.value) }]

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

const ProjectsList: React.FC<ProjectsListProps> = () => {
  const history = useHistory()
  const appContext = React.useContext(AppContext)
  const { objPermissions } = React.useMemo(() => appContext?.config || {}, [appContext])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
  const [confirmDeleteId, setOpenConfirmDeleteId] = useState<string | null>(null)
  const [filterParams, setFilterParams] = useState<FilterParamsInterface>(DEFAULT_FILTER)
  const [projects, setProjects] = useState<ListResponseInterface<ProjectListItemInterface>>(DEFAULT_PROJECTS_LIST)

  const getProjectsList = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetchListProjects({ ...filterParams })
      setProjects(res)
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setIsLoading(false)
    }
  }, [filterParams])

  const debounceGetProjectList = useMemo(() => debounce(700, getProjectsList), [getProjectsList])

  const onRowSelect = useCallback((selectedRowIds: string[]) => {
    // console.log('selectedRowIds: ', selectedRowIds)
  }, [])

  const onPageChange = useCallback((page: number) => {
    setFilterParams((prev: FilterParamsInterface) => ({ ...prev, pageNumber: page }))
  }, [])

  const onSearchTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchText: e.target.value })
  }, [])

  const onSearchTextClear = useCallback(() => {
    onFilterChange({ searchText: '' })
  }, [])

  const onResetFilter = useCallback(() => {
    setFilterParams(DEFAULT_FILTER)
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
    console.log('history: ', history);
    history.push(projectDetailPath(projectId))
  }, [])

  const onDeleteProject = useCallback(async () => {
    if (!confirmDeleteId) {
      return
    }
    try {
      setIsLoading(true)
      await deleteProject(confirmDeleteId)
      await getProjectsList()
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setIsLoading(false)
      closeConfirmDelete()
    }
  }, [confirmDeleteId])

  const projectsTableConfig: IDynamicTable<ProjectListItemInterface> = useMemo(() => ({
    data: projects.results,
    columns: projectsTableColumns(onViewProject, (objPermissions?.Project.allowDelete ? openConfirmDelete : undefined)),
    stickyHeader: false,
    getRowId: (row: ProjectListItemInterface) => row.id,
    rowSelectControl: 'allRows',
    onRowSelect,
    onSortBy: props => {
      if (props?.id) {
        onFilterChange({ sortBy: props?.id, sortType: props?.desc ? 'DESC' : 'ASC' })
      }
    },
    sortByControl: 'controlled'
  }), [projects.results, projectsTableColumns, objPermissions?.Project])

  useEffect(() => {
    if (!isLoading) {
      console.log('filterParams: ', filterParams);
      debounceGetProjectList()
    }
  }, [filterParams])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-px-4 cx-pt-4 cx-top-0 cx-bg-white cx-z-10">
        <div className="cx-flex cx-aligns-center cx-justify-between">
          <h1 className="cx-text-xl cx-font-semibold">Projects</h1>
          <ul className="menu">
            <li className="padding-right">
              <div className="searchbox searchbox--w240 cx-mb-0">
                <i className="icon ski ski-search" />
                <input
                  type="text"
                  data-sk-name="generic-filter-bar"
                  placeholder="Search projects..."
                  value={filterParams.searchText || ''}
                  onChange={onSearchTextChange}
                />
                {filterParams.searchText && (
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
      {!!confirmDeleteId && (
        <ConfirmationModal onCancel={closeConfirmDelete} onConfirm={onDeleteProject} confirmButtonText="Ok">
          Are you sure you want to delete this project?
        </ConfirmationModal>
      )}
    </div>
  )
}

export default memo(ProjectsList)
