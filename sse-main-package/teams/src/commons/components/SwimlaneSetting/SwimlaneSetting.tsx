import React, { memo, useState, ChangeEvent, useCallback, useEffect } from 'react'
import { FormInputElement, Icon, Button, PopOut, IconButton } from '@skedulo/sked-ui'
import { useSelector, useDispatch } from 'react-redux'

import { SwimlaneSetting, WeekDay, State, ITimeOption } from '../../types'
import { STORAGE_KEY } from '../../constants'
import { setLocalStorage } from '../../utils'
import { updateSwimlaneSetting } from '../../../Store/action'

import TimePicker from '../TimePicker'

const WEEKDAYS = [
  { value: 'sunday', label: 'Su' },
  { value: 'monday', label: 'Mo' },
  { value: 'tuesday', label: 'Tu' },
  { value: 'wednesday', label: 'We' },
  { value: 'thursday', label: 'Th' },
  { value: 'friday', label: 'Fr' },
  { value: 'saturday', label: 'Sa' }
]

interface ISwimlaneSettingProps {
  hideSetting: () => void
}

const SwimlaneSettingModal: React.FC<ISwimlaneSettingProps> = ({ hideSetting }) => {
  const dispatch = useDispatch()
  const defaultSetting = useSelector<State, SwimlaneSetting>(state => state.swimlaneSetting)

  const [settings, setSettings] = useState<SwimlaneSetting>(defaultSetting)

  const [timeError, setTimeError] = useState<string>('')

  const onStartTimeSelect = useCallback((selectedItem: ITimeOption) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        startTime: selectedItem.numberValue
      }
    }))
  }, [])

  const onEndTimeSelect = useCallback((selectedItem: ITimeOption) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        endTime: selectedItem.numberValue
      }
    }))
  }, [])

  const onWeekdaySelect = useCallback((e: ChangeEvent, day: WeekDay) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        days: {
          ...prev.workingHours.days,
          [day]: !prev.workingHours.days[day]
        }
      }
    }))
  }, [])

  const onApplySetting = useCallback(() => {
    setLocalStorage(STORAGE_KEY.TEAM_SWIMLANE_SETTING, JSON.stringify(settings))
    dispatch(updateSwimlaneSetting(settings))
    hideSetting()
  }, [settings])

  useEffect(() => {
    if (settings.workingHours.startTime >= settings.workingHours.endTime) {
      setTimeError('Start must be before End.')
    } else {
      setTimeError('')
    }
  }, [settings.workingHours.startTime, settings.workingHours.endTime])

  return (
    <div className="cx-bg-white cx-shadow cx-text-neutral-800">
      <div className="cx-p-4 cx-border-b  cx-flex cx-justify-between cx-items-center">
        <h2>Swimlane Settings</h2>
        <Icon name="close" className="cx-cursor-pointer" onClick={hideSetting} size={18} />
      </div>
      <div className="cx-p-4 cx-pb-0">
        <label className="cx-mb-1">Working hours</label>
        <div className="cx-mt-4 cx-flex cx-items-center cx-w-240px">
          <TimePicker
            className="cx-w-24"
            onSelect={onStartTimeSelect}
            step={60}
            defaultSelected={settings.workingHours.startTime}
          />
          <span className="cx-px-2">to </span>
          <TimePicker
            className="cx-w-24"
            onSelect={onEndTimeSelect}
            step={60}
            defaultSelected={settings.workingHours.endTime}
          />
        </div>
        {timeError && <p className="cx-pl-4 cx-pt-2 cx-text-red-700">{timeError}</p>}
        <div className="cx-pl-4 cx-my-4 cx-flex cx-justify-center">
          {WEEKDAYS.map(item => (
            <div key={item.value} className="cx-flex cx-flex-col cx-mr-2">
              <label className="cx-mb-1">{item.label}</label>
              <FormInputElement
                type="checkbox"
                name={item.value}
                // tslint:disable-next-line: jsx-no-lambda
                onChange={e => onWeekdaySelect(e, item.value as WeekDay)}
                checked={settings.workingHours.days[item.value as WeekDay]}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="cx-text-right cx-pr-4 cx-pb-4">
        <Button buttonType="primary" onClick={onApplySetting} disabled={!!timeError}>Apply</Button>
      </div>
    </div>
  )
}

const SwimlaneSettingButton: React.FC = () => {
  const swimlaneSettingTrigger = useCallback(() => {
    return (
      <IconButton
        icon="settings"
        buttonType="transparent"
        tooltipContent="Swimlane Settings"
      />
    )
  }, [])

  return (
    <PopOut
      placement="bottom"
      closeOnOuterClick={false}
      closeOnScroll={false}
      closeOnFirstClick={false}
      trigger={swimlaneSettingTrigger}
    >
      {togglePopout => (
        <SwimlaneSettingModal hideSetting={togglePopout} />
      )}
    </PopOut>
  )
}

export default memo(SwimlaneSettingButton)
