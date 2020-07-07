import React, { useState, memo, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import classNames from 'classnames'
import { SearchSelect, ISelectItem } from '@skedulo/sked-ui'
import { State } from '../../Store/types'

interface CoreSkillsPicklistProps {
  onSelect: (coreSkill: string) => void
  hasAllOption?: boolean
}

export const CoreSkillsPicklist: React.FC<CoreSkillsPicklistProps> = ({ onSelect, hasAllOption }) => {
  const coreSkills = useSelector((state: State) => state.configs?.coreSkills || [])
  const options = useMemo(() => {
    if (!hasAllOption) return coreSkills.map(item => ({ value: item.id, label: item.name }))
    return [{ value: '', label: 'All skills' }, ...coreSkills.map(item => ({ value: item.id, label: item.name }))]
  }, [coreSkills, hasAllOption])
  const [selectedItem, setSelectedItem] = useState<ISelectItem>(options[0])
  const handleSelect = useCallback((item: ISelectItem) => {
    console.log('item: ', item);
    if (item) {
      onSelect(item.value)
      setSelectedItem(item)
    }
  }, [])

  return (
    <SearchSelect
      name="coreSkill"
      items={options}
      onSelectedItemChange={handleSelect}
      selectedItem={selectedItem}
    />
  )
}

export default memo(CoreSkillsPicklist)
