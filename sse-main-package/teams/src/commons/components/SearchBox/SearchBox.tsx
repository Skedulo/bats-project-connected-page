import * as React from 'react'
import classnames from 'classnames'

import { Icon, FormInputElement } from '@skedulo/sked-ui'

interface ISearchBoxProps {
  onChange: (value: string) => void
  className?: string
  autoFocus?: boolean
  placeholder: string
  clearable?: boolean
  loading?: boolean
}

const SearchBox: React.FC<ISearchBoxProps> = ({
  onChange,
  className,
  autoFocus = true,
  placeholder,
  clearable,
  loading
}) => {
  const [value, setValue] = React.useState<string>('')
  
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!loading) {
        onChange(e.target.value)
        setValue(e.target.value)
      }
    },
    [onChange, loading]
  )

  const handleClear = React.useCallback(() => {
    if (!loading) {
      onChange('')
      setValue('')
    }
  }, [onChange, loading])

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
