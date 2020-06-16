import * as React from 'react'
import classNames from 'classnames'
import { FormInputElement, Icon, Menu, MenuItem, Loading } from '@skedulo/sked-ui'
import { getTimePickerOptions } from '../../utils'
import { ITimePickerOption } from '../../types'

interface ITimePickerProps {
  className?: string
  onSelect: (item: ITimePickerOption) => void
  defaultSelected?: number | string
  placeholderText?: string
  disabled?: boolean
  step?: number
}

const TimePicker: React.FC<ITimePickerProps> = ({
  className,
  onSelect,
  placeholderText,
  defaultSelected,
  disabled,
  step
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const timeOptions = React.useMemo(() => getTimePickerOptions(step || 15), [])
  const [openLookup, setOpenLookup] = React.useState<boolean>(false)
  const [selectedOption, setSelectedOption] = React.useState<ITimePickerOption | null>(
    timeOptions.find((item) => item.numberValue === defaultSelected || item.stringValue === defaultSelected) || null
  )

  const handleOpenLookup = React.useCallback(() => {
    if (!openLookup) {
      setOpenLookup(true)
    }
  }, [openLookup])

  const handleCloseLookup = React.useCallback(() => {
    if (openLookup) {
      setTimeout(() => {
        setOpenLookup(false)
      }, 200)
    }
  }, [openLookup])

  const handleSelect = React.useCallback((item: ITimePickerOption) => {
    setSelectedOption(item)
    onSelect(item)
    setOpenLookup(false)
  }, [])

  const TimeOptions = React.useMemo(() => {
    if (!timeOptions.length) {
      return <MenuItem>No data found.</MenuItem>
    }
    return timeOptions.map((item: ITimePickerOption) => {
      const handleClickItem = () => handleSelect(item)
      return (
        <MenuItem key={item.numberValue} onClick={handleClickItem}>
          {item.stringValue}
        </MenuItem>
      )
    })
  }, [timeOptions])

  return (
    <div className={`cx-relative ${className}`}>
      <div className="cx-absolute cx-inset-y-0 cx-left-0 cx-flex cx-items-center cx-p-2">
        <Icon name="time" size={18} className="cx-text-neutral-500" />
      </div>
      <FormInputElement
        className="cx-pl-8"
        value={selectedOption?.stringValue || ''}
        onFocus={handleOpenLookup}
        onBlur={handleCloseLookup}
        placeholder={placeholderText}
        inputRef={inputRef}
        readOnly={true}
        disabled={disabled}
      />
      <Menu hidden={!openLookup} className="cx-absolute cx-z-50 cx-w-full cx-h-40 cx-overflow-y-overlay">
        {TimeOptions}
      </Menu>
    </div>
  )
}

export default React.memo(TimePicker)
