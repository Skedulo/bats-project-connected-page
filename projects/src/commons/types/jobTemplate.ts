
export interface IJobTemplateListItem {
  name: string
  id: string
  jobType: string
  description: string
}

export interface IJobTemplateDetail extends IJobTemplateListItem {
  jobConstraints?:{},
  canEdit?:boolean,
  projectId: string,
  project?: {}
}
