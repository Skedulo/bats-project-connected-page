export const AvailabilityUpdate = `subscription AvailabilityUpdate {
  schemaAvailabilities {
    operation
    timestamp
    data {
      UID
      Status
    }
    previous {
      Status
    }
  }
}
`
export default AvailabilityUpdate
