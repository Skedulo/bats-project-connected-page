import * as React from 'react'
import { toNumber } from 'lodash'
import { SearchSelect } from '@skedulo/sked-ui'
import { parseTimeValue } from '../../utils'

const getTimePickerOptions = (step = 30, is24hFormat = false) => {
  const timeOptions = []
  let optionHour = 0

  while (Math.floor(optionHour / 60) < 24) {
    const hour = Math.floor(optionHour / 60)
    const minute = optionHour % 60
    const timeVal = hour * 100 + minute
    timeOptions.push({
      value: timeVal.toString(),
      label: parseTimeValue(timeVal, is24hFormat)
    })
    optionHour += step
  }
  return timeOptions
}

interface TimePickerOptionInterface {
  label: string
  value: string
}

interface TimePickerInterface {
  className?: string
  onSelect: (item: { stringValue: string; numberValue: number }) => void
  defaultSelected?: number | string
  placeholderText?: string
  disabled?: boolean
}

const TimePicker: React.FC<TimePickerInterface> = ({
  className,
  onSelect,
  placeholderText,
  defaultSelected,
  disabled,
}) => {
  const timeOptions: TimePickerOptionInterface[] = React.useMemo(() => getTimePickerOptions(15), [])
  const initialSelected = React.useMemo(
    () =>
      timeOptions.find(
        (item: TimePickerOptionInterface) => item.value === defaultSelected || item.label === defaultSelected
      ),
    [defaultSelected]
  )

  const handleSelect = React.useCallback((item: TimePickerOptionInterface) => {
    // setSelectedOption(item)
    onSelect({ stringValue: item?.label, numberValue: toNumber(item?.value) })
  }, [])

  return (
    <SearchSelect
      className={className}
      items={timeOptions}
      name="timePicker"
      onSelectedItemChange={handleSelect}
      disabled={disabled}
      initialSelectedItem={initialSelected}
      placeholder={placeholderText || 'Select time'}
      icon="time"
    />
  )
}

export default React.memo(TimePicker)
