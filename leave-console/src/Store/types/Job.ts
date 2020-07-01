export interface Job {
  Name: string
  UID: string
  Start: string
  End: string
  Description: string
  Account?: {
    Name: string
  }
  Contact?: {
    FullName: string
  }
  Type: string
  Address: string
  JobAllocations: {
    Resource: {
      User: {
        UID: string,
        SmallPhotoUrl: string
      }
    }
  }
}
