# creative.space.utility

A robust Electron desktop application for storage professionals, featuring pure-function calculators for storage capacity, performance, streaming, and pricing without external data dependencies.

## Features

- **Secure Architecture**: Electron with strict IPC, context isolation, and no node integration
- **Pure Calculations**: All math uses numeric inputs and inline constants - no LUTs or external data
- **Four Core Calculators**: Storage Size, Storage Performance, Stream Calculator, and Pricing
- **Modern Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Real-time Results**: Live calculations with immediate feedback
- **Professional UI**: Clean, responsive interface with tabbed navigation

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

This will open an Electron window with the React app running on localhost:5173.

### Building
```bash
# Create production build
npm run build
```

Produces installers in the `release/` directory for macOS (DMG), Windows (NSIS), and Linux (AppImage).

## Project Structure

```
src/
├── main/           # Electron main process
├── preload/        # Secure IPC bridge
├── renderer/       # React app (Vite)
└── shared/         # Shared services & modules
    ├── constants.ts # Storage calculation constants
    └── modules/    # Calculator implementations
        ├── storageCapacity/    # RAID storage calculations
        ├── storagePerformance/ # Network bandwidth analysis
        ├── streamCalc/         # Multi-link stream capacity
        └── pricing/            # Contract term pricing
```

## Architecture

### Security Model
- **Context Isolation**: `true` - Renderer cannot access Node.js APIs
- **Node Integration**: `false` - No direct Node.js access
- **Preload Bridge**: Validated IPC calls only via `window.api.calc()`
- **CSP**: Strict Content Security Policy

### IPC Pattern
```typescript
// Renderer calls main process
const result = await window.api.calc({
  module: "storageCapacity",
  fn: "calcCapacity", 
  payload: { raidType: "RAIDZ2", drivesPerVdev: 6, ... }
});
```

### Adding New Calculators

1. **Create Module Structure**:
   ```
   src/shared/modules/your-module/
   ├── index.ts           # Export calculator functions
   ├── your-module.types.ts    # Input/output types
   └── your-module.test.ts      # Unit tests
   ```

2. **Implement Calculator**:
   ```typescript
   export async function yourCalculator(input: YourInput): Promise<YourResult> {
     // Pure calculation logic using constants.ts values
     return result;
   }
   ```

3. **Add to IPC Schema**:
   ```typescript
   // src/preload/ipc-schema.ts
   export const CalcRequest = z.object({
     module: z.enum([..., "your-module"]),
     fn: z.string(),
     payload: z.unknown()
   });
   ```

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production app
- `npm run test` - Run unit tests
- `npm run lint` - ESLint check
- `npm run format` - Prettier format

### Testing
Uses Vitest for unit testing. Run tests with:
```bash
npm test          # Run once
npm run test:ui   # Interactive mode
```

### Linting & Formatting
- ESLint with TypeScript rules
- Prettier for consistent formatting
- EditorConfig for cross-editor consistency

## Assumptions

The calculators use the following heuristic values and assumptions:

- **Link Utilization**: Planned at 80% of theoretical maximum for safety
- **Write Penalty**: 80% efficiency for write operations (simplified overhead)
- **ARC Boost**: 18% read performance improvement from ZFS ARC cache
- **Storage Units**: "1 TB" treated as 1 TiB (1024 GB) for time-on-disk calculations
- **Network Speeds**: Based on common industry specifications (1G, 10G, 25G, 40G, 50G, 100G)

These values are conservative estimates suitable for production planning. Adjust constants in `src/shared/constants.ts` for your specific environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] GitHub Actions CI/CD
- [ ] Electron Store for user preferences
- [ ] Additional storage calculator modules
- [ ] Export results to CSV/JSON
- [ ] Plugin system for custom calculations
