import * as React from 'react'
import classnames from 'classnames'

import { Icon, FormInputElement } from '@skedulo/sked-ui'

interface ISearchBoxProps {
  onChange: (value: string) => void
  className?: string
  autoFocus?: boolean
  placeholder: string
  clearable?: boolean
  value?: string
}

const SearchBox: React.FC<ISearchBoxProps> = ({
  onChange,
  className,
  autoFocus = true,
  placeholder,
  value,
  clearable,
}) => {
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const handleClear = React.useCallback(() => {
    onChange('')
  }, [onChange])

  return (
    <div
      className={classnames(
        'sk-bg-white sk-border sk-border-b-0 sk-border-neutral-350 sk-text-neutral-650 sk-text-sm sk-flex sk-items-center sk-px-3 sk-py-1',
        className
      )}
    >
      <Icon name="search" className="sk-text-neutral-550" />
      <FormInputElement
        autoFocus={autoFocus}
        data-sk-name="sk-filter-search-input"
        type="text"
        placeholder={`Search ${placeholder ? placeholder.toLowerCase() : ''}...`}
        onChange={handleChange}
        className="sk-truncate sk-border-0 focus:sk-border-0"
        value={value}
      />
      {clearable && (
        <Icon className="cx-pr-2" size={18} color="#4A556A" onClick={handleClear} name="close" />
      )}
    </div>
  )
}

export default React.memo(SearchBox)
