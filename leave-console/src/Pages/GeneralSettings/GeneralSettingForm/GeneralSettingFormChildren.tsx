import * as React from 'react'
import {
  SkedFormChildren,
  Button,
  FormElementWrapper,
  SearchSelect,
  ISelectItem,
  AsyncSearchSelect,
  AsyncMultiSearchSelect,
  FormLabel,
  NumberInput,
} from '@skedulo/sked-ui'
import WrappedFormInput from '../../../components/WrappedFormInput'
import MessagePanel from '../../../components/MessagePanel'
import ColorPicker from '../../../components/ColorPicker'
import { GeneralSetting, IBaseModel } from '../../../Store/types'
import { MESSAGE_VARIABLES, DEFAULT_PALETTE_COLORS } from '../../../common/constants/setting'
import { fetchGenericOptions } from '../../../Services/DataServices'

interface IGeneralSettingFormChildrenProps {
  formParams: SkedFormChildren<GeneralSetting>
  onCancel?: () => void
  setting: GeneralSetting | null
}

const GeneralSettingFormChildren: React.FC<IGeneralSettingFormChildrenProps> = ({
  formParams,
  onCancel,
  setting
}) => {
  const { fields, customFieldUpdate, errors, submitted } = formParams
  const [paletteColors, setPaletteColors] = React.useState(DEFAULT_PALETTE_COLORS)

  const handleEditNotification = React.useCallback((template: string) => {
    console.log('template: ', template);
  }, [])

  const handleSelectColor = React.useCallback((fieldName: string) => (color: string) => {
    customFieldUpdate(fieldName, color)
  }, [])

  const handleChangePoint = React.useCallback((fieldName: string) => (value: React.ReactText) => {
    customFieldUpdate(fieldName, value)
  }, [])

  const handleNewColor = React.useCallback(
    (color: string | null) => {
      if (color && !paletteColors.includes(color)) {
        setPaletteColors([...paletteColors, color])
      }
    },
    [paletteColors]
  )

  return (
    <>
      <div className="cx-p-4">
        <h2 className="cx-semi-bold cx-text-xl cx-mb-4">Notification Settings</h2>
        <MessagePanel
          variables={MESSAGE_VARIABLES}
          label="Unavailability Approve/Decline Notification"
          onEdit={handleEditNotification}
          template="abc"
          isCustomView={true}
          required={true}
        />
        <h2 className="cx-semi-bold cx-text-xl cx-my-4">Chart Settings</h2>
        <div className="cx-mb-4 cx-flex cx-items-end">
          <div className="cx-mr-4">
            <FormLabel status="required">Availability Chart Min Point</FormLabel>
            <FormElementWrapper
              name="availabilityChartMinPoint"
              validation={{ isValid: submitted ? !errors.availabilityChartMinPoint : true, error: submitted ? errors.availabilityChartMinPoint : '' }}
            >
              <NumberInput
                step={10}
                value={fields.availabilityChartMinPoint}
                onValueChange={handleChangePoint('availabilityChartMinPoint')}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-flex cx-items-center">
            <ColorPicker
              onColorSelect={handleSelectColor('minColor')}
              onNewColor={handleNewColor}
              colors={paletteColors}
              selectedColor={DEFAULT_PALETTE_COLORS[0]}
            />
          </div>
        </div>
        <div className="cx-mb-4 cx-flex cx-items-end">
          <div className="cx-mr-4">
            <FormLabel status="required">Availability Chart Mid Point</FormLabel>
            <FormElementWrapper
              name="availabilityChartMinPoint"
              validation={{ isValid: submitted ? !errors.availabilityChartMidPoint : true, error: submitted ? errors.availabilityChartMidPoint : '' }}
            >
              <NumberInput
                step={10}
                value={fields.availabilityChartMidPoint}
                onValueChange={handleChangePoint('availabilityChartMidPoint')}
              />
            </FormElementWrapper>
          </div>
          <div className="cx-flex cx-items-center">
            <ColorPicker
              onColorSelect={handleSelectColor('mid')}
              onNewColor={handleNewColor}
              colors={paletteColors}
              selectedColor={DEFAULT_PALETTE_COLORS[0]}
            />
          </div>
        </div>
      </div>
      <div className="cx-flex cx-justify-end cx-p-4 border-top cx-bg-white cx-bottom-0 cx-sticky">
        <Button buttonType="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button buttonType="primary" className="cx-ml-2" type="submit">
          Save
        </Button>
      </div>
    </>
  )
}

export default React.memo(GeneralSettingFormChildren)
