export function calcCapacity(input) {
  // Calculate derived values from React component input
  const totalDrives = input.drivesPerVdev * input.vdevs;
  const driveCapacityTb = input.driveSizeTb;
  const parity = input.raidType === "RAIDZ1" ? 1 : input.raidType === "RAIDZ2" ? 2 : 3;
  const dataDrives = (input.drivesPerVdev - parity) * input.vdevs;
  const parityDrives = parity * input.vdevs;
  
  // ZFS calculations
  const rawTb = totalDrives * driveCapacityTb;
  const parityTb = parityDrives * driveCapacityTb;
  const usableTbBeforeZfs = dataDrives * driveCapacityTb;
  const zfsOverheadTb = usableTbBeforeZfs * input.zfsOverheadPct;
  const usableTb = usableTbBeforeZfs - zfsOverheadTb;
  
  // Performance calculations using CORRECT FORMULAS
  const readGBs = (totalDrives * input.driveSpeedMBs) / 1024;      // READ = Total drives × Drive speed
  const arcGBs = readGBs * 1.20;                                   // ARC = Read speed × 20% increase  
  const writeGBs = (dataDrives * input.driveSpeedMBs) / 1024;      // WRITE = Data drives × Drive speed
  
  const result = {
    rawTb,
    parityTb, 
    zfsOverheadTb,
    usableTbBeforeZfs,
    usableTb,
    readGBs,
    arcGBs,
    writeGBs,
    totalDrives,
    dataDrives,
    parityDrives,
    protection: `Can survive ${parity} drive${parity > 1 ? 's' : ''} per vdev`
  };
  
  return result
}

export function calcPerformance(input) {
  // Calculate derived values from React component input
  const totalDrives = input.drivesPerVdev * input.vdevs;
  const parity = input.raidType === "RAIDZ1" ? 1 : input.raidType === "RAIDZ2" ? 2 : 3;
  const dataDrives = (input.drivesPerVdev - parity) * input.vdevs;
  const parityDrives = parity * input.vdevs;
  const driveSpeedMBs = input.driveSpeedMBs;
  
  // CORRECT PERFORMANCE FORMULAS:
  const readSpeedMBs = totalDrives * driveSpeedMBs;           // READ = Total drives × Drive speed
  const arcSpeedMBs = readSpeedMBs * 1.20;                   // ARC = Read speed × 20% increase  
  const writeSpeedMBs = dataDrives * driveSpeedMBs;          // WRITE = Data drives × Drive speed
  
  // Convert to GB/s for display
  const readGBs = readSpeedMBs / 1024;
  const arcGBs = arcSpeedMBs / 1024;
  const writeGBs = writeSpeedMBs / 1024;
  
  // Calculate IOPS (approximate: 1 GB/s ≈ 4000 IOPS for typical workloads)
  const readIOPS = Math.round(readGBs * 4000);
  const writeIOPS = Math.round(writeGBs * 4000);
  
  const result = {
    readGBs,
    arcGBs,
    writeGBs,
    readIOPS,
    writeIOPS,
    readSpeedMBs,
    writeSpeedMBs,
    arcSpeedMBs,
    totalDrives,
    dataDrives,
    parityDrives,
    driveSpeedMBs
  };
  
  return result;
}
