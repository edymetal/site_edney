import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../db/dados_acoes.json');

try {
    console.log(`Reading file: ${dbPath}`);
    let rawData = fs.readFileSync(dbPath, 'utf8');

    // Inject NaN back (replace some nulls with NaN to simulate the issue)
    // We'll just replace "null" with "NaN" for testing purposes.
    // Note: This is a destructive test script.

    if (rawData.includes('null')) {
        console.log('Found null values. Reverting to NaN for testing...');
        const brokenData = rawData.replace(/: null/g, ': NaN').replace(/:null/g, ':NaN');

        fs.writeFileSync(dbPath, brokenData);
        console.log('File reverted to invalid state (NaN) for testing.');
    } else {
        console.log('No null values found to revert.');
    }

} catch (error) {
    console.error('Error processing file:', error.message);
    process.exit(1);
}
