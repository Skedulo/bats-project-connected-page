import React, { useState, memo, useCallback } from 'react'
import { Icon, Tabs } from '@skedulo/sked-ui'
import { Link } from 'react-router-dom'
import ResourceRequirementRules from '../ResourceRequirementRules'

const TAB_ROUTES = [
  { route: 'resource_requirements_rule', title: 'Resource Requirement Rules' }
]

const SettingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TAB_ROUTES[0].route)

  const onChangeTab = useCallback((tab: string) => setActiveTab(tab), [])

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
      {activeTab === TAB_ROUTES[0].route && <ResourceRequirementRules />}
    </div>
  )
}

export default memo(SettingPage)
