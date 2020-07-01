export interface ResourceLeave {
  name: string
  start: Date
  end: Date
  conflictsByDay: Map<string, number>
  conflicts: number
}
