import React, { memo, useState, ChangeEvent, useCallback, useMemo } from 'react'
import { ISwimlaneSettings, ITimeOption, WeekDay } from '../../commons/types'
import { FormInputElement, SearchSelect, ISelectItem, Icon, Button } from '@skedulo/sked-ui'
import TimePicker from '../../commons/components/TimePicker'
import { AppContext } from '../../App'

const WEEKDAYS = [
  { value: 'sunday', label: 'Su' },
  { value: 'monday', label: 'Mo' },
  { value: 'tuesday', label: 'Tu' },
  { value: 'wednesday', label: 'We' },
  { value: 'thursday', label: 'Th' },
  { value: 'friday', label: 'Fr' },
  { value: 'saturday', label: 'Sa' }
]

const TIME_SNAP_UNIT = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
]

interface ISwimlaneSettingProps {
  hideSetting: () => void
  applySetting: (settings: ISwimlaneSettings) => void
  defaultSetting: ISwimlaneSettings
}

const SwimlaneSetting: React.FC<ISwimlaneSettingProps> = ({ hideSetting, applySetting, defaultSetting }) => {
  const appContext = React.useContext(AppContext)
  const { enableWorkingHours } = React.useMemo(() => appContext?.config || {}, [appContext])
  const [settings, setSettings] = useState<ISwimlaneSettings>(defaultSetting)
  const timeSnapUnit = useMemo(() => TIME_SNAP_UNIT.find(item => item.value === settings.snapUnitConsole), [settings])
  const onSettingChange = (newSettings: ISwimlaneSettings) => {
    setSettings(newSettings)
  }

  const onEnableOnlyShowWorkingHour = useCallback((e: ChangeEvent) => {
    onSettingChange({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        enabled: !settings.workingHours.enabled,
      }
    })
  }, [settings])

  const onStartTimeSelect = useCallback((selectedTime: ITimeOption) => {
    onSettingChange({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        enabled: true,
        startTime: selectedTime.numberValue,
      }
    })
  }, [settings])

  const onEndTimeSelect = useCallback((selectedTime: ITimeOption) => {
    onSettingChange({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        enabled: true,
        endTime: selectedTime.numberValue,
      }
    })
  }, [settings])

  const onWeekdaySelect = useCallback((e: ChangeEvent, day: WeekDay) => {
    onSettingChange({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        days: {
          ...settings.workingHours.days,
          [day]: !settings.workingHours.days[day]
        }
      }
    })
  }, [settings])

  const onTimeSnapSelect = useCallback((selectItem: ISelectItem) => {
    onSettingChange({
      ...settings,
      snapUnitConsole: selectItem.value
    })
  }, [settings])

  const onApplySetting = useCallback(() => {
    applySetting(settings)
    hideSetting()
  }, [settings])

  return (
    <div className="cx-bg-white cx-shadow cx-text-neutral-800">
      <div className="cx-p-4 cx-border-b cx-border-neutral-300 cx-flex cx-justify-between cx-items-center">
        <h2>Swimlane Settings</h2>
        <Icon name="close" className="cx-cursor-pointer" onClick={hideSetting} size={18} />
      </div>
      {enableWorkingHours && (
        <div className="cx-p-4">
          <FormInputElement
            type="checkbox"
            inlineLabel="Only show working hours"
            checked={settings.workingHours.enabled}
            onChange={onEnableOnlyShowWorkingHour}
          />
        <div className="cx-pl-4 cx-mt-4 cx-flex cx-items-center">
          <TimePicker
            className="cx-w-24"
            onSelect={onStartTimeSelect}
            step={60}
            disabled={!settings.workingHours.enabled}
            defaultSelected={settings.workingHours.startTime}
          />
          <span className="cx-px-2">to </span>
          <TimePicker
            className="cx-w-24"
            onSelect={onEndTimeSelect}
            step={60}
            disabled={!settings.workingHours.enabled}
            defaultSelected={settings.workingHours.endTime}
          />
        </div>
        <div className="cx-pl-4 cx-mt-4 cx-flex cx-justify-center">
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
      )}
      <div className="cx-p-4">
        <label className="cx-mb-1">Set Time-Snap Unit</label>
        <SearchSelect
          items={TIME_SNAP_UNIT}
          name="timeSnapUnit"
          initialSelectedItem={timeSnapUnit}
          onSelectedItemChange={onTimeSnapSelect}
          icon="chevronDown"
        />
      </div>
      <div className="cx-text-right cx-pr-4 cx-pb-4">
        <Button buttonType="primary" onClick={onApplySetting}>Apply</Button>
      </div>
    </div>
  )
}

export default memo(SwimlaneSetting)
