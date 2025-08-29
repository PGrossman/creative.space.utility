# creative.space.utility

A robust Electron desktop application for creative professionals, featuring calculators and lookup tables for media production workflows.

## Features

- **Secure Architecture**: Electron with strict IPC, context isolation, and no node integration
- **Modular Design**: Reusable calculator modules and LUT services
- **Modern Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Real-time Calculations**: Live estimates for bitrate, storage, and timecode
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
    ├── services/   # LUT loader, calculator utilities
    ├── luts/       # JSON lookup tables
    └── modules/    # Calculator implementations
        ├── bitrate/    # Bitrate estimation
        ├── storage/    # Storage calculations
        └── timecode/   # Timecode utilities
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
  module: "bitrate",
  fn: "estimateBitrate", 
  payload: { codec: "prores_422_hq", resolutionKey: "1080p29.97", minutes: 10 }
});
```

### Adding New Calculators

1. **Create Module Structure**:
   ```
   src/shared/modules/your-module/
   ├── index.ts           # Export calculator functions
   ├── your-module.types.ts    # Input/output types
   ├── your-module.calculator.ts # Implementation
   └── your-module.test.ts      # Unit tests
   ```

2. **Implement Calculator**:
   ```typescript
   export async function yourCalculator(input: YourInput): Promise<YourResult> {
     // Pure calculation logic
     return result;
   }
   ```

3. **Add to IPC Schema** (if needed):
   ```typescript
   // src/preload/ipc-schema.ts
   export const YourRequest = z.object({
     module: z.literal("your-module"),
     fn: z.literal("yourCalculator"),
     payload: YourInputSchema
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
- [ ] Enhanced LUT validation and error reporting
- [ ] Additional calculator modules
- [ ] Plugin system for custom calculations
