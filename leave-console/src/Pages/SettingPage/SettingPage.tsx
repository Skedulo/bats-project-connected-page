import React, { useState, memo, useCallback } from 'react'
import { Icon, Tabs } from '@skedulo/sked-ui'
import { Link } from 'react-router-dom'
// import GeneralSettings from '../GeneralSettings'
import ResourceRequirementRules from '../ResourceRequirementRules'
import { useSelector } from 'react-redux'
import { State } from '../../Store/types'

const TAB_ROUTES = [
  { route: 'general', title: 'General' },
  { route: 'resource_requirements_rule', title: 'Resource Requirement Rules' }
]

const SettingPage: React.FC = () => {
  const { canSeeRRRSetting } = useSelector((state: State) => ({
    canSeeRRRSetting: state.configs?.canSeeRRRSetting || false
  }))
  const [activeTab, setActiveTab] = useState<string>(TAB_ROUTES[1].route)

  const onChangeTab = useCallback((tab: string) => setActiveTab(tab), [])

  if (!canSeeRRRSetting) {
    return (
      <div className="cx-p-3 cx-text-center">
        Access Forbidden
      </div>
    )
  }

  return (
    <div className="cx-flex cx-flex-col cx-h-full cx-bg-white">
      <div className="cx-p-8 cx-pb-0">
        <Link to="/" className="cx-flex cx-items-center cx-text-xs">
          <Icon name="chevronLeft" className="cx-text-primary" />
          <span className="cx-text-primary cx-capitalize">Go back</span>
        </Link>
        <div>
          <div className="cx-flex cx-justify-between cx-mb-4">
            <h1 className="cx-text-xl cx-font-semibold">
              Leave Management Settings
            </h1>
          </div>
        </div>
      </div>
      <Tabs
        tabs={TAB_ROUTES}
        currentActiveRoute={activeTab}
        onClick={onChangeTab}
      />
      {/* {activeTab === TAB_ROUTES[0].route && <GeneralSettings />} */}
      {activeTab === TAB_ROUTES[1].route && <ResourceRequirementRules />}
    </div>
  )
}

export default memo(SettingPage)
