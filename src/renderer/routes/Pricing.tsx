import React, { useState, useMemo } from 'react';

// Pricing data structure
const PRICING_DATA = {
  '1 Bay': {
    driveOptions: [1],
    driveSizes: [15.4],
    ssdOptions: [],
    pricing: {
      15.4: { '1': 10.30, '2': 7.75, '3': 6.20, '5': 4.95 }
    }
  },
  '6 Bay': {
    driveOptions: [6],
    driveSizes: [16, 20, 24],
    ssdOptions: [4, 8],
    pricing: {
      16: { '1': 10.30, '2': 7.75, '3': 6.20, '5': 4.95 },
      20: { '1': 10.30, '2': 7.75, '3': 6.20, '5': 4.95 },
      24: { '1': 10.30, '2': 7.75, '3': 6.20, '5': 4.95 }
    }
  },
  '12 Bay': {
    driveOptions: [6, 12],
    driveSizes: [16, 20, 24],
    ssdOptions: [15.36, 30.72],
    pricing: {
      16: { '1': 10.30, '2': 7.75, '3': 6.20, '5': 4.95 },
      20: { '1': 10.30, '2': 7.75, '3': 6.20, '5': 4.95 },
      24: { '1': 10.30, '2': 7.75, '3': 6.20, '5': 4.95 }
    }
  },
  '36 Bay': {
    driveOptions: [12, 18, 24, 30, 36],
    driveSizes: [16, 20, 24],
    ssdOptions: [15.36, 30.72],
    pricing: {
      16: { '1': 10.85, '2': 8.15, '3': 6.50, '5': 5.20 },
      20: { '1': 10.85, '2': 8.15, '3': 6.50, '5': 5.20 },
      24: { '1': 10.85, '2': 8.15, '3': 6.50, '5': 5.20 }
    }
  },
  '60 Bay SAS': {
    driveOptions: [20, 30, 40, 50, 60],
    driveSizes: [16, 20, 24],
    ssdOptions: [15.36, 30.72],
    pricing: {
      16: { '1': 0, '2': 0, '3': 0, '5': 0 },
      20: { '1': 0, '2': 0, '3': 0, '5': 0 },
      24: { '1': 0, '2': 0, '3': 0, '5': 0 }
    }
  },
  '60 Bay SATA': {
    driveOptions: [20, 30, 40, 50, 60],
    driveSizes: [16, 20, 24],
    ssdOptions: [15.36, 30.72],
    pricing: {
      16: { '1': 0, '2': 0, '3': 0, '5': 0 },
      20: { '1': 0, '2': 0, '3': 0, '5': 0 },
      24: { '1': 0, '2': 0, '3': 0, '5': 0 }
    }
  }
};

const SSD_PRICING = {
  4: { '1': 18.35, '2': 15.65, '3': 14.00, '5': 12.70 },
  8: { '1': 18.35, '2': 15.65, '3': 14.00, '5': 12.70 },
  15.36: { '1': 18.35, '2': 15.65, '3': 14.00, '5': 12.70 },
  30.72: { '1': 18.35, '2': 15.65, '3': 14.00, '5': 12.70 }
};

export default function Pricing() {
  const [selectedModel, setSelectedModel] = useState('6 Bay');
  const [numberOfDrives, setNumberOfDrives] = useState(6);
  const [driveSize, setDriveSize] = useState(16);
  const [ssdOption, setSsdOption] = useState('None');

  // Get current model config
  const modelConfig = PRICING_DATA[selectedModel as keyof typeof PRICING_DATA];

  // Calculate pricing
  const calculations = useMemo(() => {
    if (!modelConfig) return null;

    const drivePricing = modelConfig.pricing[driveSize as keyof typeof modelConfig.pricing];
    if (!drivePricing) return null;

    const mainStorage = numberOfDrives * driveSize;
    const ssdStorage = ssdOption === 'None' ? 0 : parseFloat(ssdOption);
    const totalStorage = mainStorage + ssdStorage;

    const results = {
      mainStorage,
      ssdStorage,
      totalStorage,
      pricing: {} as Record<string, { annual: number; monthly: number }>
    };

    // Calculate for each contract length
    ['1', '2', '3', '5'].forEach(years => {
      const driveTotal = numberOfDrives * driveSize * drivePricing[years as keyof typeof drivePricing];
      const ssdTotal = ssdStorage > 0 ? ssdStorage * SSD_PRICING[ssdStorage as keyof typeof SSD_PRICING][years as keyof typeof SSD_PRICING[typeof ssdStorage]] : 0;
      const annual = driveTotal + ssdTotal;
      const monthly = annual * 1.15; // Add 15% for monthly

      results.pricing[years] = { annual, monthly };
    });

    return results;
  }, [selectedModel, numberOfDrives, driveSize, ssdOption, modelConfig]);

  return (
    <div className="pt-2 px-6 pb-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model:</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                const newConfig = PRICING_DATA[e.target.value as keyof typeof PRICING_DATA];
                setNumberOfDrives(newConfig.driveOptions[0]);
                setDriveSize(newConfig.driveSizes[0]);
                setSsdOption('None');
              }}
            >
              {Object.keys(PRICING_DATA).map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* Number of Drives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Drives:</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={numberOfDrives}
              onChange={(e) => setNumberOfDrives(Number(e.target.value))}
            >
              {modelConfig?.driveOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Drive Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Drive Size:</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={driveSize}
              onChange={(e) => setDriveSize(Number(e.target.value))}
            >
              {modelConfig?.driveSizes.map(size => (
                <option key={size} value={size}>{size} TB</option>
              ))}
            </select>
          </div>

          {/* SSD Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SSD Option:</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={ssdOption}
              onChange={(e) => setSsdOption(e.target.value)}
            >
              <option value="None">None</option>
              {modelConfig?.ssdOptions.map(option => (
                <option key={option} value={option}>{option} TB</option>
              ))}
            </select>
          </div>


        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-3 space-y-6">
          

          {/* Pricing Table */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Pricing Table</h3>
            
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Contract Length</th>
                  <th className="text-right py-2">1 Year</th>
                  <th className="text-right py-2">2 Years</th>
                  <th className="text-right py-2">3 Years</th>
                  <th className="text-right py-2">5 Years</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Per Month (Annual)</td>
                  <td className="text-right py-2">${calculations?.pricing['1']?.annual.toFixed(2)}</td>
                  <td className="text-right py-2">${calculations?.pricing['2']?.annual.toFixed(2)}</td>
                  <td className="text-right py-2">${calculations?.pricing['3']?.annual.toFixed(2)}</td>
                  <td className="text-right py-2">${calculations?.pricing['5']?.annual.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2">Per Month (Monthly)</td>
                  <td className="text-right py-2">${calculations?.pricing['1']?.monthly.toFixed(2)}</td>
                  <td className="text-right py-2">${calculations?.pricing['2']?.monthly.toFixed(2)}</td>
                  <td className="text-right py-2">${calculations?.pricing['3']?.monthly.toFixed(2)}</td>
                  <td className="text-right py-2">${calculations?.pricing['5']?.monthly.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Storage Configuration */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Storage Configuration</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Raw Capacity:</span>
                <span>{calculations?.mainStorage.toFixed(1)} TB</span>
              </div>
              <div className="flex justify-between">
                <span>Usable Capacity:</span>
                <span>{(() => {
                  if (!calculations) return '0.0 TB';
                  
                  // Determine drives per vdev based on model
                  let drivesPerVdev;
                  if (selectedModel === '60 Bay SAS' || selectedModel === '60 Bay SATA') {
                    drivesPerVdev = 10; // 60 Bay units use 10 drives per vdev
                  } else {
                    drivesPerVdev = numberOfDrives <= 6 ? numberOfDrives : 6; // Other models use 6 drives per vdev
                  }
                  
                  // Calculate vdevs
                  const vdevs = Math.ceil(numberOfDrives / drivesPerVdev);
                  
                  // RAIDZ2 formula with efficiency factor: v × (n - 2) × S_TB × efficiency
                  const efficiency = (selectedModel === '60 Bay SAS' || selectedModel === '60 Bay SATA') ? 0.759 : 0.8;
                  const usableTB = vdevs * (drivesPerVdev - 2) * driveSize * efficiency;
                  return usableTB.toFixed(2) + ' TB';
                })()}</span>
              </div>
              <div className="flex justify-between">
                <span>Drive Configuration:</span>
                <span>{(() => {
                  // Determine drives per vdev based on model
                  let drivesPerVdev;
                  if (selectedModel === '60 Bay SAS' || selectedModel === '60 Bay SATA') {
                    drivesPerVdev = 10; // 60 Bay units use 10 drives per vdev
                  } else {
                    drivesPerVdev = numberOfDrives <= 6 ? numberOfDrives : 6; // Other models use 6 drives per vdev
                  }
                  
                  const vdevs = Math.ceil(numberOfDrives / drivesPerVdev);
                  const dataDisks = drivesPerVdev - 2;
                  return `${dataDisks} Data + 2 Parity (${vdevs} VDEV${vdevs > 1 ? 'S' : ''})`;
                })()}</span>
              </div>
              <div className="flex justify-between">
                <span>ZFS Configuration:</span>
                <span>RAIDZ2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}