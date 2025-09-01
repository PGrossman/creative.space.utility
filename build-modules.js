// Script to build shared modules for production
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesDir = path.join(__dirname, 'src/shared/modules');
const outputDir = path.join(__dirname, 'dist-electron/shared/modules');

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true });

// Copy modules to dist
function copyModules(srcDir, destDir) {
  const items = fs.readdirSync(srcDir);
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyModules(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyModules(modulesDir, outputDir);
console.log('Shared modules copied to dist-electron');
