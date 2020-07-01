export const JobAllocationsQuery = `
query getJobsAllocations ($filters: EQLQueryFilterJobAllocations!) {
  jobAllocations (filter: $filters) {
    edges {
      node {
        UID
        Status
        Job {
          UID
          Name
          Description
          Start
          End
          Account {
            Name
          }
          Contact {
            FullName
          }
          Type
          Address
          JobAllocations {
            Resource {
              User {
                UID
                SmallPhotoUrl
              }
            }
          }
        }
      }
    }
  }
}
`

export default JobAllocationsQuery
