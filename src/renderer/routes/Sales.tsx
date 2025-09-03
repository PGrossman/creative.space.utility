import React, { useState, useMemo } from 'react';

// Import the same pricing data from Pricing.tsx
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

interface SystemConfig {
  id: number;
  model: string;
  numberOfDrives: number;
  driveSize: number;
  ssdOption: string;
}

export default function Sales() {
  const [systems, setSystems] = useState<SystemConfig[]>([
    { id: 1, model: '6 Bay', numberOfDrives: 6, driveSize: 16, ssdOption: 'None' }
  ]);

  const addSystem = () => {
    if (systems.length < 3) {
      const newId = Math.max(...systems.map(s => s.id)) + 1;
      setSystems([...systems, { 
        id: newId, 
        model: '6 Bay', 
        numberOfDrives: 6, 
        driveSize: 16, 
        ssdOption: 'None' 
      }]);
    }
  };

  const updateSystem = (id: number, field: keyof SystemConfig, value: string | number) => {
    setSystems(systems.map(system => {
      if (system.id === id) {
        const updated = { ...system, [field]: value };
        
        // Reset dependent fields when model changes
        if (field === 'model') {
          const newConfig = PRICING_DATA[value as keyof typeof PRICING_DATA];
          updated.numberOfDrives = newConfig.driveOptions[0];
          updated.driveSize = newConfig.driveSizes[0];
          updated.ssdOption = 'None';
        }
        
        return updated;
      }
      return system;
    }));
  };

  const calculateSystemPricing = (system: SystemConfig) => {
    const modelConfig = PRICING_DATA[system.model as keyof typeof PRICING_DATA];
    if (!modelConfig) return null;

    const drivePricing = modelConfig.pricing[system.driveSize as keyof typeof modelConfig.pricing];
    if (!drivePricing) return null;

    const ssdStorage = system.ssdOption === 'None' ? 0 : parseFloat(system.ssdOption);
    const pricing: Record<string, { annual: number; monthly: number }> = {};

    ['1', '2', '3', '5'].forEach(years => {
      const driveTotal = system.numberOfDrives * system.driveSize * drivePricing[years as keyof typeof drivePricing];
      const ssdTotal = ssdStorage > 0 ? ssdStorage * SSD_PRICING[ssdStorage as keyof typeof SSD_PRICING][years as keyof typeof SSD_PRICING[typeof ssdStorage]] : 0;
      const annual = driveTotal + ssdTotal;
      const monthly = annual * 1.15;

      pricing[years] = { annual, monthly };
    });

    return pricing;
  };

  return (
    <div className="pt-2 px-6 pb-6 max-w-7xl mx-auto">
      <div className="space-y-8">
        {systems.map((system, index) => {
          const modelConfig = PRICING_DATA[system.model as keyof typeof PRICING_DATA];
          const pricing = calculateSystemPricing(system);
          
          return (
            <div key={system.id} className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-6 border rounded-lg bg-gray-50">
              
              {/* Left Column: System Configuration */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-semibold">System {index + 1}</h3>
                
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model:</label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={system.model}
                    onChange={(e) => updateSystem(system.id, 'model', e.target.value)}
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
                    value={system.numberOfDrives}
                    onChange={(e) => updateSystem(system.id, 'numberOfDrives', Number(e.target.value))}
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
                    value={system.driveSize}
                    onChange={(e) => updateSystem(system.id, 'driveSize', Number(e.target.value))}
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
                    value={system.ssdOption}
                    onChange={(e) => updateSystem(system.id, 'ssdOption', e.target.value)}
                  >
                    <option value="None">None</option>
                    {modelConfig?.ssdOptions.map(option => (
                      <option key={option} value={option}>{option} TB</option>
                    ))}
                  </select>
                </div>

                {/* Storage Summary */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total: </span>
                      <span>{(system.numberOfDrives * system.driveSize).toFixed(1)} TB</span>
                    </div>
                    <div>
                      <span className="font-medium">Usable: </span>
                      <span>{(() => {
                        // Calculate vdevs (6 drives per vdev for RAIDZ2)
                        const vdevs = Math.ceil(system.numberOfDrives / 6);
                        const drivesPerVdev = system.numberOfDrives <= 6 ? system.numberOfDrives : 6;
                        // RAIDZ2 formula with 20% overhead: v × (n - 2) × S_TB × 0.80
                        const usableTB = vdevs * (drivesPerVdev - 2) * system.driveSize * 0.80;
                        return usableTB.toFixed(1) + ' TB';
                      })()}</span>
                    </div>
                  </div>
                </div>

                {/* Add System Button - only show on last system and if less than 3 systems */}
                {index === systems.length - 1 && systems.length < 3 && (
                  <button
                    onClick={addSystem}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add System
                  </button>
                )}
              </div>

              {/* Right Column: Pricing Tables */}
              <div className="lg:col-span-3 space-y-4">
                
                {/* Annual Pricing Table */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Annual - System {index + 1}</h3>
                  
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
                        <td className="py-2">Per Month</td>
                        <td className="text-right py-2">${pricing?.['1']?.annual.toFixed(2) || '0.00'}</td>
                        <td className="text-right py-2">${pricing?.['2']?.annual.toFixed(2) || '0.00'}</td>
                        <td className="text-right py-2">${pricing?.['3']?.annual.toFixed(2) || '0.00'}</td>
                        <td className="text-right py-2">${pricing?.['5']?.annual.toFixed(2) || '0.00'}</td>
                      </tr>
                      <tr>
                        <td className="py-2">Yearly Total</td>
                        <td className="text-right py-2">${((pricing?.['1']?.annual || 0) * 12).toFixed(2)}</td>
                        <td className="text-right py-2">${((pricing?.['2']?.annual || 0) * 12).toFixed(2)}</td>
                        <td className="text-right py-2">${((pricing?.['3']?.annual || 0) * 12).toFixed(2)}</td>
                        <td className="text-right py-2">${((pricing?.['5']?.annual || 0) * 12).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Monthly Pricing Table */}
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Monthly - System {index + 1}</h3>
                  
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
                        <td className="py-2">Per Month</td>
                        <td className="text-right py-2">${pricing?.['1']?.monthly.toFixed(2) || '0.00'}</td>
                        <td className="text-right py-2">${pricing?.['2']?.monthly.toFixed(2) || '0.00'}</td>
                        <td className="text-right py-2">${pricing?.['3']?.monthly.toFixed(2) || '0.00'}</td>
                        <td className="text-right py-2">${pricing?.['5']?.monthly.toFixed(2) || '0.00'}</td>
                      </tr>
                      <tr>
                        <td className="py-2">Yearly Total</td>
                        <td className="text-right py-2">${((pricing?.['1']?.monthly || 0) * 12).toFixed(2)}</td>
                        <td className="text-right py-2">${((pricing?.['2']?.monthly || 0) * 12).toFixed(2)}</td>
                        <td className="text-right py-2">${((pricing?.['3']?.monthly || 0) * 12).toFixed(2)}</td>
                        <td className="text-right py-2">${((pricing?.['5']?.monthly || 0) * 12).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
