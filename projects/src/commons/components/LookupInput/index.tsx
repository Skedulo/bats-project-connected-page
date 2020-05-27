import * as React from 'react'
import classNames from 'classnames'
import { FormInputElement, Icon, Menu, MenuItem, Loading } from '@skedulo/sked-ui'

interface OptionInterface {
  UID: string,
  Name: string
}

interface LookupInputInterface {
  className?: string
  onSelect: (item: OptionInterface) => void
  onSearchKeyword: (keyword: string) => Promise<OptionInterface[]>,
  defaultSelected?: OptionInterface | null
  placeholderText?: string
}

const LookupInput: React.FC<LookupInputInterface> = ({
  className,
  onSelect,
  onSearchKeyword,
  placeholderText,
  defaultSelected
}) => {
  let searchTimeout: any = null
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [options, setOptions] = React.useState<OptionInterface[]>([])
  const [openLookup, setOpenLookup] = React.useState<boolean>(false)
  const [loadingOptions, setLoadingOptions] = React.useState<boolean>(false)
  const [lookupKeyword, setLookupKeyword] = React.useState<string>('')
  const [selectedOption, setSelectedOption] = React.useState<OptionInterface | null>(null)

  const searchOptions = async (keyword: string) => {
    setLoadingOptions(true)
    const res = await onSearchKeyword(keyword)
    setOptions(res || [])
    setLoadingOptions(false)
    return res
  }

  React.useEffect(() => {
    if (defaultSelected && defaultSelected.UID && defaultSelected.Name) {
      setSelectedOption(defaultSelected)
    }
    searchOptions('')
  }, [])

  const handleOpenLookup = React.useCallback(() => {
    if (!openLookup) {
      setOpenLookup(true)
    }
  }, [openLookup])

  const handleCloseLookup = React.useCallback(() => {
    if (openLookup) {
      setTimeout(() => {
        setOpenLookup(false)
      }, 400)
    }
  }, [openLookup])

  const handleChangeKeyword = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value
    setLookupKeyword(newKeyword)
    clearTimeout(searchTimeout)

    searchTimeout = setTimeout(() => {
      searchOptions(newKeyword)
    }, 1000)
  }, [])

  const handleSelect = React.useCallback((item: OptionInterface) => {
    setSelectedOption(item)
    onSelect(item)
    setOpenLookup(false)
  }, [])

  const handleRemove = React.useCallback(() => {
    setSelectedOption(null)
    setLookupKeyword('')
    onSelect({ UID: '', Name: '' })
    if (inputRef && inputRef.current) {
      setTimeout(() => {
        inputRef?.current?.focus()
      }, 100)
    }
  }, [])

  const LookupOptions = React.useMemo(() => {
    if (!options.length) {
      return <MenuItem>No data found.</MenuItem>
    }
    return options.map((item: OptionInterface) => {
      const handleClickItem = () => handleSelect(item)
      return (
        <MenuItem key={item.UID} onClick={handleClickItem}>
          {item.Name}
        </MenuItem>
      )
    })
  }, [options])

  const inputClasses = classNames('cx-relative', {
    'cx-hidden': selectedOption,
  })

  return (
    <div className={`cx-relative ${className}`}>
      <div className={inputClasses}>
        <FormInputElement
          value={lookupKeyword}
          onChange={handleChangeKeyword}
          onFocus={handleOpenLookup}
          onBlur={handleCloseLookup}
          placeholder={placeholderText}
          inputRef={inputRef}
        />
        <div className="cx-absolute cx-inset-y-0 cx-right-0 cx-flex cx-items-center cx-p-2">
          <Icon name="search" size={18} className="cx-text-neutral-500" />
        </div>
      </div>
      {selectedOption && (
        <div
          className="cx-flex cx-items-center cx-justify-between cx-border-neutral-450 cx-border cx-p-2 cx-rounded-sm"
        >
          <h2>{selectedOption.Name}</h2>
          <Icon name="close" size={20} className="cx-text-neutral-500 cx-inline-block" onClick={handleRemove} />
        </div>
      )}
      <Menu hidden={!openLookup} className="cx-absolute cx-z-50 cx-w-full">
        {loadingOptions && <Loading />}
        {!loadingOptions && LookupOptions}
      </Menu>
    </div>
  )
}

export default React.memo(LookupInput)
