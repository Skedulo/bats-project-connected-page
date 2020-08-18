import * as React from 'react'
import { omit } from 'lodash/fp'
import { SkedFormChildren, SkedFormValidation, ISelectItem } from '@skedulo/sked-ui'
import GeneralSettingFormChildren from './GeneralSettingFormChildren'
import { GeneralSetting } from '../../../Store/types'

const GeneralSettingFormConfig = {
  minColor: { isRequired: 'Min color is required' },
  midColor: { isRequired: 'Mid color is required' },
  maxColor: { isRequired: 'Max color is required' },
  availabilityChartMinPoint: { isRequired: 'Availability Chart Min Point is required' },
  availabilityChartMidPoint: { isRequired: 'Availability Chart Mid Point is required' },
  availabilityChartMaxPoint: { isRequired: 'Availability Chart Max Point is required' }
}

interface IGeneralSettingFormProps {
  setting: GeneralSetting | null
  onSubmit: (setting: GeneralSetting) => void
  onCancel?: () => void
}

const GeneralSettingForm: React.FC<IGeneralSettingFormProps> = ({
  setting,
  onSubmit,
  onCancel
}) => {

  const handleSubmit = React.useCallback(
    async (form: SkedFormChildren<GeneralSetting>) => {
      const submitData = {
        ...setting,
        ...form.fields
      }
      console.log('submitData: ', submitData);
      // onSubmit(submitData)
    },
    [setting]
  )

  return (
    <SkedFormValidation
      config={GeneralSettingFormConfig}
      options={{ clickToEdit: false }}
      onSubmit={handleSubmit}
      initialValues={setting || {}}
    >
      {(formParams: SkedFormChildren<GeneralSetting>) => (
        <GeneralSettingFormChildren
          formParams={formParams}
          onCancel={onCancel}
          setting={setting}
        />
      )}
    </SkedFormValidation>
  )
}

export default React.memo(GeneralSettingForm)
