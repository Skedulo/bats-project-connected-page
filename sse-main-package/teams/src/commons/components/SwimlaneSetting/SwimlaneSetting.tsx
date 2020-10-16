import React, { memo, useState, ChangeEvent, useCallback, useEffect } from 'react'
import { SwimlaneSetting, WeekDay, State } from '../../types'
import { FormInputElement, Icon, Button, Time, PopOut, IconButton } from '@skedulo/sked-ui'
import { useSelector } from 'react-redux'

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
  const defaultSetting = useSelector<State>(state => state.swimlaneSetting) as SwimlaneSetting
  
  const [settings, setSettings] = useState<SwimlaneSetting>(defaultSetting)

  const [timeError, setTimeError] = useState<string>('')


  const applySwimlaneSetting = useCallback((setting: SwimlaneSetting) => {
    console.log('setting: ', setting);
  }, [])

  // const onStartTimeSelect = useCallback((stringValue: string) => {
  //   setSettings(prev => ({
  //     ...prev,
  //     workingHours: {
  //       ...prev.workingHours,
  //       startTime: stringValue,
  //     }
  //   }))
  // }, [])

  // const onEndTimeSelect = useCallback((stringValue: string) => {
  //   setSettings(prev => ({
  //     ...prev,
  //     workingHours: {
  //       ...prev.workingHours,
  //       endTime: stringValue,
  //     }
  //   }))
  // }, [])

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
    console.log('settings: ', settings);
    hideSetting()
  }, [settings])

  useEffect(() => {
    if (settings.workingHours.startTime >= settings.workingHours.endTime) {
      setTimeError('Start must be before End.')
    } else if (!!timeError) {
      setTimeError('')
    }
  }, [settings.workingHours.startTime, settings.workingHours.endTime])

  return (
    <div className="cx-bg-white cx-shadow cx-text-neutral-800">
      <div className="cx-p-4 cx-border-b cx-border-neutral-400 cx-flex cx-justify-between cx-items-center">
        <h2>Swimlane Settings</h2>
        <Icon name="close" className="cx-cursor-pointer" onClick={hideSetting} size={18} />
      </div>
      <div className="cx-p-4 cx-pb-0">
        {/* <div className="cx-pl-4 cx-mt-4 cx-flex cx-items-center">
          <Time
            onChange={onStartTimeSelect}
            increment={60}
            disabled={!settings.workingHours.enabled}
            value={settings.workingHours.startTime}
          />
          <span className="cx-px-2">to </span>
          <Time
            onChange={onEndTimeSelect}
            increment={60}
            disabled={!settings.workingHours.enabled}
            value={settings.workingHours.endTime}
          />
        </div> */}
        {timeError && <p className="cx-pl-4 cx-pt-2 cx-text-red-700">{timeError}</p>}
        <div className="cx-pl-4 cx-mt-2 cx-flex cx-justify-center">
          {WEEKDAYS.map(item => (
            <div key={item.value} className="cx-flex cx-flex-col cx-mr-2">
              <label className="cx-mb-1">{item.label}</label>
              <FormInputElement
                type="checkbox"
                name={item.value}
                // tslint:disable-next-line: jsx-no-lambda
                onChange={e => onWeekdaySelect(e, item.value as WeekDay)}
                checked={settings.workingHours.days[item.value as WeekDay]}
                disabled={!settings.workingHours.enabled}
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
