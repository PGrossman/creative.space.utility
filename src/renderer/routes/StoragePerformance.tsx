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
    const frameRates = codecData
      .filter(item => item.resolution === selectedResolution)
      .map(item => item.frame_rate);
    return [...new Set(frameRates)].sort((a, b) => a - b);
  }, [codecData, selectedResolution]);

  // Get filtered codec families based on resolution + frame rate - THIRD level
  const codecFamilies = useMemo(() => {
    if (!selectedResolution || selectedFrameRate === null) return [];
    const families = codecData
      .filter(item => 
        item.resolution === selectedResolution &&
        item.frame_rate === selectedFrameRate
      )
      .map(item => item.codec_family);
    return [...new Set(families)].sort();
  }, [codecData, selectedResolution, selectedFrameRate]);

  // Get filtered codecs based on resolution + frame rate + codec family - FOURTH level
  const availableCodecs = useMemo(() => {
    if (!selectedResolution || selectedFrameRate === null || !selectedFamily) return [];
    const codecs = codecData
      .filter(item => 
        item.resolution === selectedResolution &&
        item.frame_rate === selectedFrameRate &&
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

    // Find the exact codec match - NEW ORDER
    const codecMatch = codecData.find(item =>
      item.resolution === selectedResolution &&
      item.frame_rate === selectedFrameRate &&
      item.codec_family === selectedFamily &&
      item.codec === selectedCodec
    );

    if (!codecMatch) {
      setResult(null);
      return;
    }

    // Calculate storage metrics using your exact bitrate_MBps values
    const mbpsRate = codecMatch.bitrate_MBps; // Already in MB/s from your JSON
    const gbPerHour = (mbpsRate * 3600) / 1024; // Convert to GB/hour
    const tbPerHour = gbPerHour / 1024; // Convert to TB/hour
    const gbPerDay = gbPerHour * 24; // GB per day
    const tbPerDay = tbPerHour * 24; // TB per day
    
    const hoursPerGB = 1 / gbPerHour; // Hours that fit in 1GB
    const hoursPerTB = 1 / tbPerHour; // Hours that fit in 1TB

    setResult({
      selectedCodec: codecMatch,
      hoursPerGB,
      hoursPerTB,
      gbPerHour,
      tbPerHour,
      gbPerDay,
      tbPerDay
    });
  }, [codecData, selectedFamily, selectedResolution, selectedFrameRate, selectedCodec]);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Right: Storage Calculations */}
      <div className="space-y-4">
        {/* Storage per Time */}
        <div className="border rounded-xl p-5 bg-white/50">
          <h3 className="font-semibold mb-4">Storage Requirements</h3>
          {result ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Per Hour:</span>
                <span className="font-medium">{formatStorage(result.gbPerHour)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Per Day (24h):</span>
                <span className="font-medium">
                  {result.gbPerDay < 1024 
                    ? `${result.gbPerDay.toFixed(1)} GB/day`
                    : `${result.tbPerDay.toFixed(2)} TB/day`
                  }
                </span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-lg font-bold text-center">
                  {result.tbPerHour >= 1 
                    ? `${result.tbPerHour.toFixed(3)} TB/hr`
                    : `${result.gbPerHour.toFixed(2)} GB/hr`
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Select all codec parameters to see storage calculations
            </div>
          )}
        </div>

        {/* Recording Duration */}
        <div className="border rounded-xl p-5 bg-white/50">
          <h3 className="font-semibold mb-4">Recording Duration</h3>
          {result ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Per 1 GB:</span>
                <span className="font-medium">{formatDuration(result.hoursPerGB)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Per 1 TB:</span>
                <span className="font-medium">{formatDuration(result.hoursPerTB)}</span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-lg font-bold text-center">
                  {result.hoursPerTB < 24 
                    ? `${result.hoursPerTB.toFixed(1)} hrs/TB`
                    : `${(result.hoursPerTB / 24).toFixed(1)} days/TB`
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Duration calculations will appear here
            </div>
          )}
        </div>

        {/* Data Rate Info */}
        <div className="border rounded-xl p-5 bg-white/50">
          <h3 className="font-semibold mb-4">Technical Details</h3>
          {result ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bitrate:</span>
                <span className="font-medium">{result.selectedCodec.bitrate_Mbps.toFixed(2)} Mbps</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Data Rate:</span>
                <span className="font-medium">{result.selectedCodec.bitrate_MBps.toFixed(2)} MB/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Codec Family:</span>
                <span className="font-medium">{result.selectedCodec.codec_family}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Technical details will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}