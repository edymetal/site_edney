import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, '../db/dados_acoes.json');
const destDir = path.join(__dirname, '../src/assets');
const destPath = path.join(destDir, 'dados_acoes.txt');

try {
    // Ensure assets directory exists
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    console.log(`Copying ${sourcePath} to ${destPath}...`);
    fs.copyFileSync(sourcePath, destPath);
    console.log('File copied successfully.');

} catch (error) {
    console.error('Error copying file:', error.message);
    process.exit(1);
}
