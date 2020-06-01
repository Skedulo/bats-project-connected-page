export interface IObjPermission {
  allowCreate: boolean
  allowDelete: boolean
  allowRead: boolean
  allowUpdate: boolean
}

export interface IAppContext {
  config: IConfig
}

export interface ITimePickerOption {
  stringValue: string,
  numberValue: number
}

export interface IBaseModel {
  name: string
  id: string
}

export interface IConfig {
  jobTypes?: IBaseModel[],
  projectStatuses?: IBaseModel[],
  objPermissions?: {
    Project: IObjPermission
    // ProjectJobTemplate: IObjPermission
  }
}
