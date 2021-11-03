// internal connected page route
export const listProjectPath = () => '/'
export const projectDetailPath = (projectId = ':projectId') => `/${projectId}`
// export const jobDetailPath = (jobId: string) => `/${jobId}`

// skedulo standard route
export const createJobPath = () => `/c/d/bats`
export const jobDetailPath = (jobId: string) => `/c/d/bats?jobId=${jobId}`
