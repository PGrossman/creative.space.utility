export function calcCapacity(input) {
  console.log('Storage calc input:', input)
  
  const result = {
    totalRawCapacity: input.totalDrives * input.driveCapacity,
    usableCapacity: Math.floor(input.totalDrives * input.driveCapacity * 0.8),
    raidOverhead: Math.floor(input.totalDrives * input.driveCapacity * 0.2)
  }
  
  console.log('Storage calc result:', result)
  return result
}

export function calcPerformance(input) {
  console.log('Performance calc input:', input)
  
  const result = {
    readIOPS: input.totalDrives * 1000,
    writeIOPS: input.totalDrives * 800
  }
  
  console.log('Performance calc result:', result)
  return result
}
