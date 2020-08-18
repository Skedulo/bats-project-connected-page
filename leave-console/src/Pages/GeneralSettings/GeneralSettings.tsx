import React, { useState, memo, useCallback } from 'react'
import { Icon, Tabs } from '@skedulo/sked-ui'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from '../../Store/types'
import { LoadingTrigger } from '../../components/GlobalLoading'
import GeneralSettingForm from './GeneralSettingForm'
import ColorPicker from '../../components/ColorPicker'
import { MESSAGE_VARIABLES, DEFAULT_PALETTE_COLORS } from '../../common/constants/setting'

const GeneralSettings: React.FC = () => {
  const { configs } = useSelector((state: State) => ({
    configs: state.configs || {}
  }))
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSubmit = React.useCallback(
    (data: any) => {
      console.log('data: ', data);
    },
    []
  )

  return (
    <div className="cx-p-4">
      {isLoading && <LoadingTrigger />}
      <GeneralSettingForm
        setting={null}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default memo(GeneralSettings)
