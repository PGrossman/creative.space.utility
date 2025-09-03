import React, { useState, useEffect, useMemo } from 'react';
import { streamsForAllLinks, gbPerHour, timeOnOneTBHours } from '../../shared/modules/streamCalc';

// Types based on your exact JSON structure
interface CodecData {
  codec_family: string;
  codec: string;
  resolution: string;
  frame_rate: number;
  bitrate_Mbps: number;
  bitrate_MBps: number;
}

const ALLOWED_RESOLUTIONS = ['HD', 'UHD', '6K', '8K'];

export default function StreamCalculator() {
  const [codecData, setCodecData] = useState<CodecData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedResolution, setSelectedResolution] = useState<string>('');
  const [selectedFrameRate, setSelectedFrameRate] = useState<number | null>(null);
  const [selectedCodec, setSelectedCodec] = useState<string>('');

  useEffect(() => {
    const loadCodecData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('../../datasources/master_codec_bitrates_v2.1.csv');
        if (!response.ok) {
          throw new Error(`Failed to load codec data: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        const Papa = await import('papaparse');
        const parsed = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim()
        });

        if (parsed.errors.length > 0) {
          console.warn('CSV parsing warnings:', parsed.errors);
        }

        const filteredData = parsed.data.filter((item: any) => 
          ALLOWED_RESOLUTIONS.includes(item.resolution)
        );

        console.log('Loaded codec data from CSV:', filteredData.length, 'records');
        setCodecData(filteredData);
        
      } catch (error) {
        console.error('Error loading codec data:', error);
        setError('Failed to load codec data');
      } finally {
        setLoading(false);
      }
    };
    
    loadCodecData();
  }, []);

  const availableResolutions = useMemo(() => {
    const resolutions = [...new Set(codecData.map(item => item.resolution))];
    const order = ['HD', 'UHD', '6K', '8K'];
    return resolutions.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [codecData]);

  const availableFrameRates = useMemo(() => {
    if (!selectedResolution) return [];
    
    let frameRates = [...new Set(
      codecData
        .filter(item => item.resolution === selectedResolution)
        .map(item => item.frame_rate)
    )].sort((a, b) => a - b);
    
    frameRates = frameRates.map(rate => rate === 24.0 ? 25.0 : rate);
    
    return frameRates;
  }, [codecData, selectedResolution]);

  const codecFamilies = useMemo(() => {
    if (!selectedResolution || selectedFrameRate === null) return [];
    
    const lookupFrameRate = selectedFrameRate === 25.0 ? 24.0 : selectedFrameRate;
    
    const families = codecData
      .filter(item => 
        item.resolution === selectedResolution &&
        item.frame_rate === lookupFrameRate
      )
      .map(item => item.codec_family);
    return [...new Set(families)].sort();
  }, [codecData, selectedResolution, selectedFrameRate]);

  const availableCodecs = useMemo(() => {
    if (!selectedResolution || selectedFrameRate === null || !selectedFamily) return [];
    
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

  const selectedCodecData = useMemo(() => {
    if (!selectedFamily || !selectedResolution || selectedFrameRate === null || !selectedCodec) {
      return null;
    }

    const lookupFrameRate = selectedFrameRate === 25.0 ? 24.0 : selectedFrameRate;

    const codecMatch = codecData.find(item => {
      return (
        item.resolution === selectedResolution &&
        item.frame_rate === lookupFrameRate &&
        item.codec_family === selectedFamily &&
        String(item.codec).trim() === String(selectedCodec).trim()
      );
    });

    if (!codecMatch) return null;

    const bitrateMultiplier = selectedFrameRate === 25.0 ? (25.0 / 24.0) : 1.0;
    
    return {
      ...codecMatch,
      frame_rate: selectedFrameRate,
      bitrate_Mbps: codecMatch.bitrate_Mbps * bitrateMultiplier,
      bitrate_MBps: codecMatch.bitrate_MBps * bitrateMultiplier
    };
  }, [codecData, selectedFamily, selectedResolution, selectedFrameRate, selectedCodec]);

  // Use the existing streamCalc functions
  const streamCalculations = useMemo(() => {
    if (!selectedCodecData) return [];
    return streamsForAllLinks(selectedCodecData.bitrate_Mbps);
  }, [selectedCodecData]);

  const storageTime = useMemo(() => {
    if (!selectedCodecData) return null;
    const totalHours = timeOnOneTBHours(selectedCodecData.bitrate_Mbps);
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return { hours, minutes, totalHours };
  }, [selectedCodecData]);

  const gbPerHourValue = useMemo(() => {
    if (!selectedCodecData) return null;
    return gbPerHour(selectedCodecData.bitrate_Mbps);
  }, [selectedCodecData]);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT Column: Codec Selection */}
        <div className="border rounded-xl p-5 bg-white/50">
          <h3 className="font-semibold mb-4">Codec Selection</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Resolution:</label>
            <select
              className="w-full border rounded p-2"
              value={selectedResolution}
              onChange={(e) => {
                setSelectedResolution(e.target.value);
                setSelectedFrameRate(null);
                setSelectedFamily('');
                setSelectedCodec('');
              }}
            >
              <option value="">Select Resolution</option>
              {availableResolutions.map(resolution => (
                <option key={resolution} value={resolution}>{resolution}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Frame Rate:</label>
            <select
              className="w-full border rounded p-2"
              value={selectedFrameRate || ''}
              onChange={(e) => {
                setSelectedFrameRate(e.target.value ? Number(e.target.value) : null);
                setSelectedFamily('');
                setSelectedCodec('');
              }}
              disabled={!selectedResolution}
            >
              <option value="">Select Frame Rate</option>
              {availableFrameRates.map(rate => (
                <option key={rate} value={rate}>{rate} fps</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Codec Family:</label>
            <select
              className="w-full border rounded p-2"
              value={selectedFamily}
              onChange={(e) => {
                setSelectedFamily(e.target.value);
                setSelectedCodec('');
              }}
              disabled={!selectedResolution || selectedFrameRate === null}
            >
              <option value="">Select Codec Family</option>
              {codecFamilies.map(family => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
          </div>

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
        </div>

        {/* RIGHT Column: Data Rate Information + Tables */}
        <div className="space-y-6">
          
          {/* Data Rate Information */}
          <div className="border rounded-xl p-5 bg-white/50">
            <h3 className="font-semibold mb-4">Data Rate Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Selected Configuration:</span>
                <span className="text-right text-sm">
                  {selectedCodecData 
                    ? `${selectedCodecData.resolution} ${selectedCodecData.frame_rate}fps ${selectedCodecData.codec_family} ${selectedCodecData.codec}`
                    : 'None selected'
                  }
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Data Rate:</span>
                <span>{selectedCodecData ? `${selectedCodecData.bitrate_Mbps.toFixed(0)} Mbps` : '—'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">1 Hour:</span>
                <span>{gbPerHourValue ? `${gbPerHourValue.toFixed(2)} GB` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Streams Supported Table */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Number of Simultaneous Streams Supported</h3>
            
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Network Speed</th>
                  <th className="text-right py-2 font-medium">Streams Supported</th>
                </tr>
              </thead>
              <tbody>
                {streamCalculations.map(({ nic, streams }) => (
                  <tr key={nic} className="border-b border-gray-100">
                    <td className="py-2">{nic}</td>
                    <td className="py-2 text-right font-mono">
                      {streams.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Storage Time Table */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Storage Time on 1 TB Hard Drive</h3>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Time:</span>
              <span className="text-lg">
                {storageTime 
                  ? `${storageTime.hours} hours and ${storageTime.minutes} minutes`
                  : '—'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}