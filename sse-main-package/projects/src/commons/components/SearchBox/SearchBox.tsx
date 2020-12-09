import * as React from 'react'
import classnames from 'classnames'

import { Icon, FormInputElement } from '@skedulo/sked-ui'
import { debounce, toNumber } from 'lodash'

interface ISearchBoxProps {
  onChange: (value: string) => void
  className?: string
  autoFocus?: boolean
  placeholder: string
  clearable?: boolean
  loading?: boolean
  clearInput?: boolean
  debounceTime?: number
}

const SearchBox: React.FC<ISearchBoxProps> = ({
  onChange,
  className,
  autoFocus = true,
  placeholder,
  clearable,
  loading,
  clearInput,
  debounceTime
}) => {
  const [value, setValue] = React.useState<string>('')

  const deboundChange = React.useMemo(() => {
    return debounceTime ? debounce(onChange, toNumber(debounceTime) || 0) : onChange
  }, [debounceTime, onChange])

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!loading) {
        deboundChange(e.target.value)
        setValue(e.target.value)
      }
    },
    [deboundChange, loading]
  )

  const handleClear = React.useCallback(() => {
    if (!loading) {
      onChange('')
      setValue('')
    }
  }, [onChange, loading])

  React.useEffect(() => {
    if (clearInput) {
      handleClear()
    }
  }, [clearInput])

  return (
    <div
      className={classnames(
        'cx-bg-white cx-border cx-border-b-0 cx-border-neutral-350 cx-text-neutral-650 cx-text-sm cx-flex cx-items-center cx-px-3',
        className
      )}
    >
      <Icon name="search" className="cx-text-neutral-550" />
      <FormInputElement
        autoFocus={autoFocus}
        data-cx-name="cx-filter-search-input"
        type="text"
        placeholder={`Search ${placeholder ? placeholder.toLowerCase() : ''}...`}
        onChange={handleChange}
        className="cx-truncate cx-border-0 focus:cx-border-0"
        value={value}
      />
      {clearable && (
        <Icon className="cx-pr-2" size={18} color="#4A556A" onClick={handleClear} name="close" />
      )}
    </div>
  )
}

export default React.memo(SearchBox)
