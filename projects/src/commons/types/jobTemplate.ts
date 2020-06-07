
export interface IJobTemplateListItem {
  name: string
  id: string
  type: string
  description: string
}

export interface IJobTemplateDetail extends IJobTemplateListItem {
  jobDependencies?:{}
}
