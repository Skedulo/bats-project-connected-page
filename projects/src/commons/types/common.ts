export interface IObjPermission {
  allowCreate: boolean
  allowDelete: boolean
  allowRead: boolean
  allowUpdate: boolean
}

export interface IAppContext {
  config: IConfig
  setAppConfig?: React.Dispatch<React.SetStateAction<IConfig>>
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
  jobStatuses?: IBaseModel[],
  projectStatuses?: IBaseModel[],
  objPermissions?: {
    Project: IObjPermission
    // ProjectJobTemplate: IObjPermission
  }
  jobTypeTemplates?: IJobTypeTemplate[]
  jobTypeTemplateValues?: Record<string, IResourceRequirement>
}

export interface IJobTypeTemplate {
  id: string
  name: string
  schemaName: string
}

export interface IJobTypeTemplateValue {
  field: string
  id: string
  rel: string
  templateId: string
  value: string
}

export interface IResourceRequirement {
  totalQty: number,
  jobType: string,
  requirements: string
}
