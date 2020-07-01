import React from 'react'
import { Button, Icon, Datepicker } from '@skedulo/sked-ui'

import './TimePicker.scss'

interface CustomTimePickerInputProps {
  onClick?: () => void
  value?: string
  disabled?: boolean
}

const CustomTimePickerInput: React.RefForwardingComponent<HTMLButtonElement, CustomTimePickerInputProps> = React.forwardRef(({ onClick, value, disabled = false }, ref) => {
  return (
    <Button
      buttonType="secondary"
      onClick={ onClick }
      className="sk-w-full"
      disabled={ disabled }
      ref={ ref }
    >
      <div className="sk-flex sk-justify-between">
        { value || '--:--'  }
        <Icon name="time" className="sk-ml-2" size={ 18 } />
      </div>
    </Button>
  )
})

interface TimePickerProps {
  selected?: Date,
  onChange?: (date: Date) => void,
  disabled?: boolean,
}

const TimePicker: React.FC<TimePickerProps> = ({ selected = null, onChange, disabled = false, ...otherProps }) => {
  return (
    <Datepicker
      className="sk-w-full"
      dateFormat="h:mm a"
      selected={ selected }
      onChange={ onChange }
      customInput={ <CustomTimePickerInput /> }
      disabled={ disabled }
      showTimeSelect
      showTimeSelectOnly
      { ...otherProps }
    />
  )
}

export default TimePicker
