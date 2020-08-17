// internal connected page route
export const listProjectPath = () => '/'
export const projectDetailPath = (projectId = ':projectId') => `/${projectId}`
// export const jobDetailPath = (jobId: string) => `/${jobId}`

// skedulo standard route
export const createJobPath = () => '/Jobs/create'
export const jobDetailPath = (jobId: string) => `/jobdetails/${jobId}`
