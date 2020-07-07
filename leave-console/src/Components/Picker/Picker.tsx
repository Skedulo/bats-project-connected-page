import * as React from 'react'
import classNames from 'classnames'
import { FormInputElement, Icon, Menu, MenuItem, Loading, ISelectItem, ButtonDropdown } from '@skedulo/sked-ui'

interface IPickerProps {
  className?: string
  onSelect: (item: ISelectItem) => void
  defaultSelected?: ISelectItem
  disabled?: boolean
  items: ISelectItem[]
}

const Picker: React.FC<IPickerProps> = ({
  className,
  onSelect,
  defaultSelected,
  disabled,
  items
}) => {
  const [selectedOption, setSelectedOption] = React.useState<ISelectItem>(defaultSelected || items[0])

  const handleSelect = React.useCallback((item: ISelectItem) => {
    setSelectedOption(item)
    onSelect(item)
  }, [])

  const Options = React.useMemo(() => {
    return items.map((item: ISelectItem) => {
      const handleClickItem = () => handleSelect(item)
      return (
        <MenuItem key={item.value} onClick={handleClickItem}>
          {item.label}
        </MenuItem>
      )
    })
  }, [items])

  return (
    <ButtonDropdown
      className={className}
      label={selectedOption.label}
      disabled={disabled}
      buttonType="secondary"
    >
      <Menu>
        {Options}
      </Menu>
    </ButtonDropdown>
  )
}

export default React.memo(Picker)
