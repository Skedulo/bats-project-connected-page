import React, { useEffect, useState, useCallback, memo, useMemo, ChangeEvent, useContext } from 'react'
import { debounce } from 'lodash/fp'
import {
  DynamicTable,
  IDynamicTable,
  Pagination,
  ActionMenu,
  Button,
  ConfirmationModal,
  FormInputElement,
} from '@skedulo/sked-ui'
import RuleFilter from './RuleFilter'
import CreateRuleModal from './CreateRuleModal'
import LoadingTrigger from '../../Components/GlobalLoading/LoadingTrigger'
import { ResourceRequirementRule, FilterParams, IListResponse } from '../../Store/types'
import SearchBox from '../../Components/SearchBox'
import { toastMessage } from '../../common/utils/toast'
import { DEFAULT_FILTER, WEEKDAYS } from '../../common/constants'
import {
  fetchResourceRequirementRules,
  createUpdateResourceRequirementRule,
  deleteResourceRequirementRule,
} from '../../Services/DataServices'

interface ResourceRequirementRulesProps {
  children?: any
}

export const DEFAULT_LIST = {
  results: [],
  totalItems: 0,
}

export const rulesTableColumns = (
  onEdit: (rule: ResourceRequirementRule) => void,
  onDelete: (ruleId: string) => void
) => {
  const weekdays = WEEKDAYS.map(item => ({
    Header: item.label,
    accessor: item.value,
    width: '1%',
    minWidth: '1%',
    emptyCellText: <FormInputElement type="checkbox" checked={false} disabled={true} />,
    Cell: ({ cell }: { cell: { value: boolean } }) => {
      return (
        <FormInputElement type="checkbox" checked={cell.value} disabled={true} />
      )
    },
  }))

  return [
    {
      Header: 'Name',
      accessor: 'name',
      width: '20%',
      Cell: ({ cell, row }: { cell: { value: string }; row: { original: ResourceRequirementRule } }) => {
        const handleEdit = () => onEdit(row.original)

        return (
          <div className="cx-cursor-pointer" onClick={handleEdit}>
            <div className="cx-text-neutral-850">{cell.value}</div>
            <div className="cx-text-neutral-600">{row.original.description}</div>
          </div>
        )
      },
    },
    {
      Header: 'Region',
      accessor: 'region.name',
    },
    {
      Header: 'Start date',
      accessor: 'startDate',
      emptyCellText: '-',
    },
    {
      Header: 'End date',
      accessor: 'endDate',
      emptyCellText: '-',
    },
    ...weekdays,
    {
      Header: 'Category',
      accessor: 'category',
      emptyCellText: '-',
    },
    {
      Header: 'Core skill',
      accessor: 'coreSkill',
      emptyCellText: '-',
    },
    {
      Header: 'Depot',
      accessor: 'depot.name',
      emptyCellText: '-',
    },
    {
      Header: 'Min. Resources',
      accessor: 'numberOfResources'
    },
    {
      Header: '',
      accessor: 'id',
      disableSortBy: true,
      Cell: ({ cell, row }: { cell: { value: string }; row: { original: ResourceRequirementRule } }) => {
        const actionItems = [
          { label: 'View/Edit', onClick: () => onEdit(row.original) },
          { label: 'Delete', onClick: () => onDelete(cell.value) },
        ]

        return (
          <div className="cx-text-right">
            <ActionMenu menuItems={actionItems} />
          </div>
        )
      },
    },
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
    setIsLoading(true)
    const res = await fetchResourceRequirementRules({ ...params })
    setRules(res)
    setIsLoading(false)
  }, [])

  const debounceGetRules = useMemo(() => debounce(700, getResourceRequirementRules), [getResourceRequirementRules])

  const onPageChange = useCallback((page: number) => {
    setFilterParams((prev: FilterParams) => ({ ...prev, pageNumber: page }))
  }, [])

  const onSearchTextChange = useCallback((value: string) => {
    if (!isLoading) {
      onFilterChange({ searchText: value })
    }
  }, [isLoading])

  const onResetFilter = useCallback(() => {
    setFilterParams(DEFAULT_FILTER)
  }, [])

  const onFilterChange = useCallback((params: FilterParams) => {
    setFilterParams((prev: FilterParams) => ({ ...prev, ...params }))
  }, [])

  const openRuleModal = useCallback(() => {
    setOpenCreateModal(true)
  }, [])

  const closeRuleModal = useCallback(() => {
    setOpenCreateModal(false)
    setEditingRule(null)
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmId(null)
  }, [])

  const onSave = useCallback(async (data: Partial<ResourceRequirementRule>) => {
    setIsLoading(true)
    const success = await createUpdateResourceRequirementRule(data)
    if (success) {
      await getResourceRequirementRules(filterParams)
    }
    closeRuleModal()
    setIsLoading(false)
  }, [filterParams])

  const onEdit = useCallback((rule: ResourceRequirementRule) => {
    setEditingRule(rule)
    openRuleModal()
  }, [])

  const onDelete = useCallback(async () => {
    if (!confirmId) {
      return
    }
    setIsLoading(true)
    const success = await deleteResourceRequirementRule(confirmId)
    if (success) {
      await getResourceRequirementRules(filterParams)
    } else {
      toastMessage.error('Deleted unsuccessfully!')
    }
    setIsLoading(false)
    closeConfirm()
  }, [confirmId, filterParams])

  const rulesTableConfig: IDynamicTable<ResourceRequirementRule> = useMemo(
    () => ({
      data: rules.results,
      columns: rulesTableColumns(
        onEdit,
        (ruleId: string) => setConfirmId(ruleId)
      ),
      stickyHeader: false,
      getRowId: (row: ResourceRequirementRule) => row.id,
      rowSelectControl: 'disabled',
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
      <div className="cx-bg-white cx-z-10">
        <RuleFilter onResetFilter={onResetFilter} onFilterChange={onFilterChange} filterParams={filterParams} />
        <div className="cx-flex cx-items-center cx-justify-end cx-px-4 cx-mb-2">
          <div className="cx-flex">
            <SearchBox
              className="cx-px-4 cx-py-0 cx-mb-0 cx-border cx-mr-2"
              onChange={onSearchTextChange}
              placeholder="rules"
              clearable={!!filterParams.searchText}
              value={filterParams.searchText || ''}
              autoFocus={false}
            />
            <Button buttonType="primary" onClick={openRuleModal}>
              New rule
            </Button>
          </div>
        </div>
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
        <CreateRuleModal rule={editingRule} onClose={closeRuleModal} onSubmit={onSave} />
      )}
      {!!confirmId && (
        <ConfirmationModal
          onCancel={closeConfirm}
          onConfirm={onDelete}
          confirmButtonText="Ok"
        >
          {`Are you sure you want to delete this rule?`}
        </ConfirmationModal>
      )}
    </div>
  )
}

export default memo(ResourceRequirementRules)
