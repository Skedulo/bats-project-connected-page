import React from 'react'

import { classes } from '../../common/utils/classes'
import { minutesToDuration, calculateDurationInMinutes } from '../../common/utils/dateTimeHelpers'
import {
  ConfirmationModal,
  FormLabel,
  FormInputElement,
  ButtonDropdown,
  MenuItem,
  Menu,
  Datepicker,
  Icon
} from '@skedulo/sked-ui'

import TimePicker from '../../Components/TimePicker'

import './RescheduleModal.scss'

const bem = classes('reschedule-modal')

interface RescheduleModalProps {
  resources: string[]
  job: string,
  toggleModalVisibility: () => void,
}

interface RescheduleModalState {
  reassignedResource: string,
  selectedDate: Date,
  Start: string,
  End: string,
  duration: number,
}

class RescheduleModal extends React.PureComponent<RescheduleModalProps, RescheduleModalState> {
  constructor(props: RescheduleModalProps) {
    super(props)

    this.state = {
      reassignedResource: null,
      selectedDate: undefined,
      Start: undefined,
      End: undefined,
      duration: null
    }
  }

  handleTimeChange = (type: 'Start' | 'End') => (value: Date) => {
    const valueISO = value.toISOString()
    const startDateTime = type === 'Start' ? valueISO : this.state.Start
    const endDateTime = type === 'End' ? valueISO : this.state.End
    this.setState({
      ...this.state,
      [type]: value.toISOString(),
      duration: calculateDurationInMinutes(startDateTime, endDateTime)
    })
  }

  render() {
    const { resources, job, toggleModalVisibility } = this.props
    const { reassignedResource, selectedDate, Start, End, duration } = this.state

    return (
      <ConfirmationModal
        confirmButtonText="Save"
        autoWidth
        onCancel={ toggleModalVisibility }
        onConfirm={ () => undefined }
      >
        <div className={ bem() }>
          <h1 className={ bem('title') }>Reschedule</h1>
          <div className={ bem('form') }>
            <div className={ bem('input') }>
              <FormLabel id="related">Related to</FormLabel>
              <FormInputElement
                id="related"
                name="related"
                type="text"
                disabled
                value={ job }
              />
            </div>
            <div className={ bem('input') }>
              <FormLabel id="description">Description</FormLabel>
              <FormInputElement
                id="description"
                name="description"
                type="text"
              />
            </div>
            <div className={ bem('input') }>
              <FormLabel>Rassign to</FormLabel>
              <ButtonDropdown
                className={ bem('dropdown') }
                label={ reassignedResource ? reassignedResource : 'Please select' }
                buttonType="secondary"
              >
                <Menu>
                  { resources.map(resource =>
                    <MenuItem
                      key={ resource }
                      onClick={ () => this.setState({ reassignedResource: resource }) }
                    >
                      { resource }
                    </MenuItem>
                  ) }
                </Menu>
              </ButtonDropdown>
            </div>

            <div className={ bem('input', { date: true }) }>
              <FormLabel>Date</FormLabel>
              <Datepicker
                selected={ selectedDate }
                onChange={ selectedDate => this.setState({ selectedDate }) }
              />
              <Icon name="calendar" size={ 20 } />
            </div>

            <div className={ bem('time-inputs') }>

              <div className={ bem('input', { time: true }) }>
                <FormLabel>Start time</FormLabel>
                <TimePicker
                  selected={ Start ? new Date(Start) : Start }
                  onChange={ this.handleTimeChange('Start') }
                />
              </div>
              <div className={ bem('input', { time: true }) }>
                <FormLabel>End time</FormLabel>
                <TimePicker
                  selected={ End ? new Date(End) : End }
                  onChange={ this.handleTimeChange('End') }
                />
              </div>
              <div className={ bem('input') }>
                <FormLabel id="duration">Duration</FormLabel>
                <FormInputElement
                  id="duration"
                  name="duration"
                  type="text"
                  disabled
                  value={ (!Start || !End) ? '' : minutesToDuration(duration) }
                />
              </div>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    )
  }
}

export default RescheduleModal
