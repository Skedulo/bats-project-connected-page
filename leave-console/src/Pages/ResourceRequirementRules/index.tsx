import React, { useEffect, useState, useCallback, memo, useMemo, ChangeEvent, useContext } from 'react'
import { debounce } from 'lodash/fp'
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
import RuleFilter from './RuleFilter'
import CreateRuleModal from './CreateRuleModal'
import LoadingTrigger from '../../Components/GlobalLoading/LoadingTrigger'
import { ResourceRequirementRule, FilterParams, IListResponse } from '../../Store/types'
import SearchBox from '../../Components/SearchBox'
import { toastMessage } from '../../common/utils/toast'
import { DEFAULT_FILTER } from '../../common/constants'
import { fetchResourceRequirementRules } from '../../Services/DataServices'

interface ResourceRequirementRulesProps {
  children?: any
}

export const DEFAULT_LIST = {
  results: [],
  totalItems: 0,
}

export const rulesTableColumns = (
  onEdit: (projectId: string) => void,
  onDelete?: (projectId: string) => void
) => {
  return [
    {
      Header: 'Name',
      accessor: 'projectName',
      width: '20%',
    },
    {
      Header: 'Region',
      accessor: 'RegionId',
      width: '30%',
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
    }
  ]
}

const ResourceRequirementRules: React.FC<ResourceRequirementRulesProps> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)

  const [confirmId, setConfirmId] = useState<string | null>(null)

  const [filterParams, setFilterParams] = useState<FilterParams>(DEFAULT_FILTER)

  const [rules, setRules] = useState<IListResponse<ResourceRequirementRule>>(DEFAULT_LIST)

  const [editingRule, setEditingRule] = useState<ResourceRequirementRule | null>(null)

  const getResourceRequirementRules = useCallback(async (params: FilterParams) => {
    try {
      setIsLoading(true)
      const res = await fetchResourceRequirementRules({ ...params })
      console.log('res: ', res);
      // setProjects(res)
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const debounceGetRules = useMemo(() => debounce(700, getResourceRequirementRules), [getResourceRequirementRules])

  const onRowSelect = useCallback((selectedRowIds: string[]) => {
    // console.log('selectedRowIds: ', selectedRowIds)
  }, [])

  const onPageChange = useCallback((page: number) => {
    setFilterParams((prev: FilterParams) => ({ ...prev, pageNumber: page }))
  }, [])

  const onSearchTextChange = useCallback((value: string) => {
    onFilterChange({ searchText: value })
  }, [])

  const onResetFilter = useCallback(() => {
    setFilterParams(DEFAULT_FILTER)
  }, [])

  const onFilterChange = useCallback((params: FilterParams) => {
    setFilterParams((prev: FilterParams) => ({ ...prev, ...params }))
  }, [])

  const toggleCreateModal = useCallback(() => {
    setOpenCreateModal((prev: boolean) => !prev)
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmId(null)
  }, [])

  const onSave = useCallback(async (data: Partial<ResourceRequirementRule>) => {
    try {
      // setIsLoading(true)
      // const res = await createProject(data)
      // setProjects(res)
      // setFilterParams(DEFAULT_FILTER)
    } catch (error) {
      console.log('error: ', error)
    } finally {
      setOpenCreateModal(false)
      setIsLoading(false)
    }
  }, [])

  const onEdit = useCallback(async () => {
    // const projectId = confirmId?.split(',')[1]
    // if (!projectId) {
    //   return
    // }
    // setIsLoading(true)
    // const success = await cancelProject(projectId)
    // if (success) {
    //   await getResourceRequirementRules(filterParams)
    // } else {
    //   toastMessage.error('Cancelled unsuccessfully!')
    // }
    // setIsLoading(false)
    // closeConfirm()
  }, [confirmId, filterParams])

  const onDelete = useCallback(async () => {
    // const projectId = confirmId?.split(',')[1]

    // if (!projectId) {
    //   return
    // }
    // setIsLoading(true)
    // const success = await deleteProject(projectId)
    // if (success) {
    //   await getResourceRequirementRules(filterParams)
    // } else {
    //   toastMessage.error('Deleted unsuccessfully!')
    // }
    // setIsLoading(false)
    closeConfirm()
  }, [confirmId, filterParams])

  const rulesTableConfig: IDynamicTable<ResourceRequirementRule> = useMemo(
    () => ({
      data: rules.results,
      columns: rulesTableColumns(
        onEdit,
        onDelete
      ),
      stickyHeader: false,
      getRowId: (row: ResourceRequirementRule) => row.id,
      rowSelectControl: 'allRows',
      // onRowSelect,
      // onSortBy: props => {
      //   if (props?.id) {
      //     onFilterChange({ sortBy: props?.id, sortType: props?.desc ? 'DESC' : 'ASC' })
      //   }
      // },
      sortByControl: 'disabled',
      initialRowStateKey: 'id',
    }),
    [rules, rulesTableColumns]
  )

  useEffect(() => {
    if (!isLoading) {
      debounceGetRules(filterParams)
    }
  }, [filterParams])

  return (
    <div className="scroll">
      {isLoading && <LoadingTrigger />}
      <div className="cx-sticky cx-top-0 cx-bg-white cx-z-10">
        <div className="cx-flex cx-items-center cx-justify-end cx-px-4 cx-pt-4">
          <div className="cx-flex">
            <SearchBox
              className="cx-px-4 cx-py-0 cx-mb-0 cx-border cx-mr-2"
              onChange={onSearchTextChange}
              placeholder="rules"
              clearable={!!filterParams.searchText}
              value={filterParams.searchText || ''}
              autoFocus={false}
            />
            <Button buttonType="primary" onClick={toggleCreateModal}>
              Create new
            </Button>
          </div>
        </div>
        <RuleFilter onResetFilter={onResetFilter} onFilterChange={onFilterChange} filterParams={filterParams} />
      </div>
      <DynamicTable {...rulesTableConfig} />
      {rules.results.length > 0 && (
        <Pagination
          itemsTotal={rules.totalItems}
          itemsPerPage={filterParams.pageSize || 0}
          currentPage={filterParams.pageNumber || 1}
          onPageChange={onPageChange}
          className="cx-static"
        />
      )}
      {openCreateModal && (
        <CreateRuleModal rule={editingRule} onClose={toggleCreateModal} onSubmit={onSave} />
      )}
      {!!confirmId && (
        <ConfirmationModal
          onCancel={closeConfirm}
          onConfirm={onDelete}
          confirmButtonText="Ok"
        >
          {`Are you sure you want to delete this project?`}
        </ConfirmationModal>
      )}
    </div>
  )
}

export default memo(ResourceRequirementRules)
