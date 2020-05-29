export interface IObjPermission {
  allowCreate: boolean
  allowDelete: boolean
  allowRead: boolean
  allowUpdate: boolean
}

export interface IAppContext {
  config: {
    projectStatuses?: { id: string, name: string }[],
    objPermissions?: {
      Project: IObjPermission
      ProjectJobTemplate: IObjPermission
    }
  }
}

export interface ITimePickerOption {
  stringValue: string,
  numberValue: number
}
