import React, { useState, useEffect, useMemo } from 'react';

// Types based on your exact JSON structure
interface CodecData {
  codec_family: string;
  codec: string;
  resolution: string;
  frame_rate: number;
  bitrate_Mbps: number;
  bitrate_MBps: number;
}

interface StorageResult {
  selectedCodec: CodecData | null;
  hoursPerGB: number;
  hoursPerTB: number;
  gbPerHour: number;
  tbPerHour: number;
  gbPerDay: number;
  tbPerDay: number;
}

// Filter to only HD, UHD, 6K, 8K as requested
const ALLOWED_RESOLUTIONS = ['HD', 'UHD', '6K', '8K'];

export default function StoragePerformance() {
  const [codecData, setCodecData] = useState<CodecData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedResolution, setSelectedResolution] = useState<string>('');
  const [selectedFrameRate, setSelectedFrameRate] = useState<number | null>(null);
  const [selectedCodec, setSelectedCodec] = useState<string>('');
  
  // Client bandwidth calculator state
  const [simultaneousUsers, setSimultaneousUsers] = useState<number>(1);
  const [readsPerUser, setReadsPerUser] = useState<number>(2);
  const [writesPerUser, setWritesPerUser] = useState<number>(1);
  const [networkInterface, setNetworkInterface] = useState<string>('10G');
  
  // Result state
  const [result, setResult] = useState<StorageResult | null>(null);

  // Load codec data on mount
  useEffect(() => {
    const loadCodecData = async () => {
      try {
        setLoading(true);
        const response = await fetch('../../datasources/master_codec_bitrates_FULL_named.json');
        if (!response.ok) {
          throw new Error(`Failed to load codec data: ${response.status}`);
        }
        const data: CodecData[] = await response.json();
        
        // Filter to only allowed resolutions
        const filteredData = data.filter(item => 
          ALLOWED_RESOLUTIONS.includes(item.resolution)
        );
        
        setCodecData(filteredData);
        setError(null);
      } catch (err) {
        console.error('Error loading codec data:', err);
        setError('Failed to load codec database. Please check the file path.');
      } finally {
        setLoading(false);
      }
    };

    loadCodecData();
  }, []);

  // Get unique resolutions - FIRST level (show all available)
  const availableResolutions = useMemo(() => {
    const resolutions = [...new Set(codecData.map(item => item.resolution))];
    return resolutions.sort();
  }, [codecData]);

  // Get filtered frame rates based on selected resolution - SECOND level
  const availableFrameRates = useMemo(() => {
    if (!selectedResolution) return [];
    
    let frameRates = [...new Set(
      codecData
        .filter(item => item.resolution === selectedResolution)
        .map(item => item.frame_rate)
    )]
      .sort((a, b) => a - b);
    
    // Replace 24.0 with 25.0 fps for better PAL compatibility
    frameRates = frameRates.map(rate => rate === 24.0 ? 25.0 : rate);
    
    return frameRates;
  }, [codecData, selectedResolution]);

  // Get filtered codec families based on resolution + frame rate - THIRD level
  const codecFamilies = useMemo(() => {
    if (!selectedResolution || selectedFrameRate === null) return [];
    
    // Convert 25.0 fps selection back to 24.0 for data lookup
    const lookupFrameRate = selectedFrameRate === 25.0 ? 24.0 : selectedFrameRate;
    
    const families = codecData
      .filter(item => 
        item.resolution === selectedResolution &&
        item.frame_rate === lookupFrameRate
      )
      .map(item => item.codec_family);
    return [...new Set(families)].sort();
  }, [codecData, selectedResolution, selectedFrameRate]);

  // Get filtered codecs based on resolution + frame rate + codec family - FOURTH level
  const availableCodecs = useMemo(() => {
    if (!selectedResolution || selectedFrameRate === null || !selectedFamily) return [];
    
    // Convert 25.0 fps selection back to 24.0 for data lookup
    const lookupFrameRate = selectedFrameRate === 25.0 ? 24.0 : selectedFrameRate;
    
    const codecs = codecData
      .filter(item => 
        item.resolution === selectedResolution &&
        item.frame_rate === lookupFrameRate &&
        item.codec_family === selectedFamily
      )
      .map(item => item.codec);
    return [...new Set(codecs)].sort();
  }, [codecData, selectedResolution, selectedFrameRate, selectedFamily]);

  // Calculate storage requirements when all selections are made
  useEffect(() => {
    if (!selectedFamily || !selectedResolution || selectedFrameRate === null || !selectedCodec) {
      setResult(null);
      return;
    }

    // Convert 25.0 fps selection back to 24.0 for data lookup
    const lookupFrameRate = selectedFrameRate === 25.0 ? 24.0 : selectedFrameRate;

    // Find the exact codec match using converted frame rate for lookup
    const codecMatch = codecData.find(item =>
      item.resolution === selectedResolution &&
      item.frame_rate === lookupFrameRate &&
      item.codec_family === selectedFamily &&
      item.codec === selectedCodec
    );

    if (!codecMatch) {
      setResult(null);
      return;
    }

    // If we're showing 25fps, scale the 24fps bitrate by 25/24
    const bitrateMultiplier = selectedFrameRate === 25.0 ? (25.0 / 24.0) : 1.0;
    
    // Calculate storage metrics using scaled bitrate_MBps values
    const scaledMBps = codecMatch.bitrate_MBps * bitrateMultiplier;
    const scaledMbps = codecMatch.bitrate_Mbps * bitrateMultiplier;
    
    const gbPerHour = (scaledMBps * 3600) / 1024; // Convert to GB/hour
    const tbPerHour = gbPerHour / 1024; // Convert to TB/hour
    const gbPerDay = gbPerHour * 24; // GB per day
    const tbPerDay = tbPerHour * 24; // TB per day
    
    const hoursPerGB = 1 / gbPerHour; // Hours that fit in 1GB
    const hoursPerTB = 1 / tbPerHour; // Hours that fit in 1TB

    // Create a scaled codec data object for display
    const scaledCodecData = {
      ...codecMatch,
      frame_rate: selectedFrameRate, // Show the selected frame rate (25.0)
      bitrate_Mbps: scaledMbps,
      bitrate_MBps: scaledMBps
    };

    setResult({
      selectedCodec: scaledCodecData,
      hoursPerGB,
      hoursPerTB,
      gbPerHour,
      tbPerHour,
      gbPerDay,
      tbPerDay
    });
  }, [codecData, selectedFamily, selectedResolution, selectedFrameRate, selectedCodec]);

  // Client bandwidth calculations
  const bandwidthResults = useMemo(() => {
    if (!result?.selectedCodec) {
      return {
        totalGbps: 0,
        totalGBps: 0,
        storageUsageTBhr: 0
      };
    }

    // Calculate total operations
    const totalOperations = simultaneousUsers * (readsPerUser + writesPerUser);
    
    // Calculate bandwidth requirements
    const totalMbps = result.selectedCodec.bitrate_Mbps * totalOperations;
    const totalGbps = totalMbps / 1000; // Convert to Gbps
    const totalGBps = totalMbps / 8 / 1000; // Convert to GB/s (divide by 8 for bits to bytes, then 1000 for GB)
    
    // Calculate storage usage in TB/hr
    const totalMBps = result.selectedCodec.bitrate_MBps * totalOperations;
    const storagePerHourGB = (totalMBps * 3600) / 1024; // Convert to GB/hr
    const storageUsageTBhr = storagePerHourGB / 1000; // Convert to TB/hr

    return {
      totalGbps: totalGbps,
      totalGBps: totalGBps,
      storageUsageTBhr: storageUsageTBhr
    };
  }, [result, simultaneousUsers, readsPerUser, writesPerUser]);

  // Network utilization calculation
  const networkUtilization = useMemo(() => {
    if (!networkInterface || bandwidthResults.totalGBps === 0) {
      return { percentage: 0, maxBandwidth: 0 };
    }
    
    // Convert network interface to GB/s (rough approximation)
    const networkGBps = {
      '1G': 0.125,    // 1 Gbps = 0.125 GB/s
      '10G': 1.25,    // 10 Gbps = 1.25 GB/s
      '25G': 3.125,   // 25 Gbps = 3.125 GB/s
      '40G': 5.0,     // 40 Gbps = 5.0 GB/s
      '50G': 6.25,    // 50 Gbps = 6.25 GB/s
      '100G': 12.5    // 100 Gbps = 12.5 GB/s
    }[networkInterface] || 1.25;
    
    const percentage = Math.min((bandwidthResults.totalGBps / networkGBps) * 100, 100);
    
    return {
      percentage: percentage,
      maxBandwidth: networkGBps
    };
  }, [bandwidthResults.totalGBps, networkInterface]);

  // No resets - just let calculations update automatically
  // The bitRateResults useMemo will handle finding valid combinations
  // If combination doesn't exist, show empty results but preserve selections

  // Utility functions for smart unit display
  const formatStorage = (gb: number) => {
    if (gb < 1024) {
      return `${gb.toFixed(2)} GB/hr`;
    } else {
      return `${(gb / 1024).toFixed(3)} TB/hr`;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(2)} hours`;
    } else {
      return `${(hours / 24).toFixed(1)} days`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading codec database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600 text-center">
          <div className="text-lg font-semibold mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Two-column layout for CODEC Selection and Client */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Codec Selection */}
      <div className="border rounded-xl p-5 bg-white/50">
        <h3 className="font-semibold mb-4">Codec Selection</h3>

        {/* Resolution - FIRST */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Resolution:</label>
          <select
            className="w-full border rounded p-2"
            value={selectedResolution}
            onChange={(e) => setSelectedResolution(e.target.value)}
          >
            <option value="">Select Resolution</option>
            {availableResolutions.map(resolution => (
              <option key={resolution} value={resolution}>{resolution}</option>
            ))}
          </select>
        </div>

        {/* Frame Rate - SECOND */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Frame Rate:</label>
          <select
            className="w-full border rounded p-2"
            value={selectedFrameRate || ''}
            onChange={(e) => setSelectedFrameRate(e.target.value ? Number(e.target.value) : null)}
            disabled={!selectedResolution}
          >
            <option value="">Select Frame Rate</option>
            {availableFrameRates.map(rate => (
              <option key={rate} value={rate}>{rate} fps</option>
            ))}
          </select>
        </div>

        {/* Codec Family - THIRD */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Codec Family:</label>
          <select
            className="w-full border rounded p-2"
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            disabled={!selectedResolution || selectedFrameRate === null}
          >
            <option value="">Select Codec Family</option>
            {codecFamilies.map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>

        {/* Codec - FOURTH */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Codec:</label>
          <select
            className="w-full border rounded p-2"
            value={selectedCodec}
            onChange={(e) => setSelectedCodec(e.target.value)}
            disabled={!selectedFamily}
          >
            <option value="">Select Codec</option>
            {availableCodecs.map(codec => (
              <option key={codec} value={codec}>{codec}</option>
            ))}
          </select>
        </div>

        {/* Selected Codec Info */}
        {result?.selectedCodec && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Selected Codec:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Family:</strong> {result.selectedCodec.codec_family}</div>
              <div><strong>Codec:</strong> {result.selectedCodec.codec}</div>
              <div><strong>Resolution:</strong> {result.selectedCodec.resolution}</div>
              <div><strong>Frame Rate:</strong> {result.selectedCodec.frame_rate} fps</div>
              <div><strong>Bitrate:</strong> {result.selectedCodec.bitrate_Mbps.toFixed(2)} Mbps</div>
              <div><strong>Data Rate:</strong> {result.selectedCodec.bitrate_MBps.toFixed(2)} MB/s</div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Client Bandwidth Calculator */}
      <div className="border rounded-xl p-5 bg-white/50">
        <h2 className="text-xl font-bold mb-6 text-center">Client</h2>
        
        {/* Simultaneous Users */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Simultaneous Users:
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={simultaneousUsers}
              onChange={(e) => setSimultaneousUsers(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute right-2 top-2 flex flex-col">
              <button
                type="button"
                onClick={() => setSimultaneousUsers(prev => prev + 1)}
                className="text-xs px-1 hover:bg-gray-200"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => setSimultaneousUsers(prev => Math.max(1, prev - 1))}
                className="text-xs px-1 hover:bg-gray-200"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Reads per User */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reads per User:
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={readsPerUser}
              onChange={(e) => setReadsPerUser(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute right-2 top-2 flex flex-col">
              <button
                type="button"
                onClick={() => setReadsPerUser(prev => prev + 1)}
                className="text-xs px-1 hover:bg-gray-200"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => setReadsPerUser(prev => Math.max(0, prev - 1))}
                className="text-xs px-1 hover:bg-gray-200"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Writes per User */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Writes per User:
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={writesPerUser}
              onChange={(e) => setWritesPerUser(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute right-2 top-2 flex flex-col">
              <button
                type="button"
                onClick={() => setWritesPerUser(prev => prev + 1)}
                className="text-xs px-1 hover:bg-gray-200"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => setWritesPerUser(prev => Math.max(0, prev - 1))}
                className="text-xs px-1 hover:bg-gray-200"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Network Interface */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Network Interface:
          </label>
          <select
            value={networkInterface}
            onChange={(e) => setNetworkInterface(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1G">1G</option>
            <option value="10G">10G</option>
            <option value="25G">25G</option>
            <option value="40G">40G</option>
            <option value="50G">50G</option>
            <option value="100G">100G</option>
          </select>
        </div>

        {/* Total Bandwidth Required */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-bold text-gray-800 mb-3">Total Bandwidth Required:</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Gigabits per second:</span>
              <span className="font-medium">
                {bandwidthResults.totalGbps.toFixed(2)} Gbps
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gigabytes per second:</span>
              <span className="font-medium">
                {bandwidthResults.totalGBps.toFixed(2)} GB/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Usage:</span>
              <span className="font-medium">
                {bandwidthResults.storageUsageTBhr.toFixed(2)} TB/hr
              </span>
            </div>
          </div>
        </div>
      </div>
      
      </div> {/* END of two-column grid */}

      {/* Network Bandwidth Utilization & Server Grid - FULL WIDTH */}
      <div className="mt-8">
        {/* Network Bandwidth Utilization Bar */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-bold text-center mb-4 text-blue-600">
            Network Bandwidth Utilization
          </h3>
          
          <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300 ease-in-out"
              style={{ width: `${networkUtilization.percentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700">
              {networkUtilization.percentage.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center mt-2 text-sm text-gray-600">
            Maximum Bandwidth: {networkUtilization.maxBandwidth.toFixed(2)} GB/s
          </div>
        </div>

        {/* Server Configuration Grid - NO SCROLL */}
        <div className="grid grid-cols-6 gap-4">
          
          {/* Portable */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-blue-600 font-bold mb-2">Portable</div>
            <div className="text-sm text-gray-600 mb-3">
              <div>Storage: 16 TB</div>
              <div>Hours: 433.60</div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <div className={`${bandwidthResults.totalGBps > 4.0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Read: 4.00 GB/s
              </div>
              <div className={`${bandwidthResults.totalGBps > 3.0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Write: 3.00 GB/s
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div>7.7" x 7.4" x 1.9"</div>
              <div>1 x 120v</div>
            </div>
          </div>

          {/* Desktop */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-blue-600 font-bold mb-2">Desktop</div>
            <div className="text-sm text-gray-600 mb-3">
              <div>Storage: 32 TB</div>
              <div>Hours: 867.21</div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <div className={`${bandwidthResults.totalGBps > 15.0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Read: 15.00 GB/s
              </div>
              <div className={`${bandwidthResults.totalGBps > 0.9 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Write: 0.90 GB/s
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div>15.8" x 12.5" x 9"</div>
              <div>1 x 120v</div>
            </div>
          </div>

          {/* 12 Bay Server */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-blue-600 font-bold mb-2">12 Bay Server</div>
            <div className="text-sm text-gray-600 mb-3">
              <div>Storage: 192 TB</div>
              <div>Hours: 5203.25</div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <div className={`${bandwidthResults.totalGBps > 8.50 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Read: 8.50 GB/s
              </div>
              <div className={`${bandwidthResults.totalGBps > 1.80 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Write: 1.80 GB/s
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div>2RU x 22"</div>
              <div>2 x 120v</div>
            </div>
          </div>

          {/* 36 Bay Server */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-blue-600 font-bold mb-2">36 Bay Server</div>
            <div className="text-sm text-gray-600 mb-3">
              <div>Storage: 576 TB</div>
              <div>Hours: 15609.76</div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <div className={`${bandwidthResults.totalGBps > 9.0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Read: 9.00 GB/s
              </div>
              <div className={`${bandwidthResults.totalGBps > 5.40 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Write: 5.40 GB/s
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div>4RU x 26.8"</div>
              <div>2 x 120v</div>
            </div>
          </div>

          {/* 60 Bay Server */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-blue-600 font-bold mb-2">60 Bay Server</div>
            <div className="text-sm text-gray-600 mb-3">
              <div>Storage: 960 TB</div>
              <div>Hours: 26016.26</div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <div className={`${bandwidthResults.totalGBps > 24.0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Read: 24.0 GB/s
              </div>
              <div className={`${bandwidthResults.totalGBps > 10.80 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Write: 10.80 GB/s
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div>4RU x 37.4"</div>
              <div>4 x 120v or 2 x 208v</div>
            </div>
          </div>

          {/* 108 Bay Server */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-blue-600 font-bold mb-2">108 Bay Server</div>
            <div className="text-sm text-gray-600 mb-3">
              <div>Storage: 1728 TB</div>
              <div>Hours: 46829.27</div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <div className={`${bandwidthResults.totalGBps > 24.0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Read: 24.0 GB/s
              </div>
              <div className={`${bandwidthResults.totalGBps > 18.0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                Write: 18.0 GB/s
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div>4RU x 41"</div>
              <div>2 x 208v</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}