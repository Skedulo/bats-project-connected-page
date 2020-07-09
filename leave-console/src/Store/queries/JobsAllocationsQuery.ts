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
          Duration
          Timezone
          Start
          End
          Region {
            UID
            Name
          }
          Account {
            Name
          }
          Contact {
            FullName
          }
          Type
          Address
          JobAllocations(filter: "Status != 'Deleted'") {
            Resource {
              UID
              Name
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
