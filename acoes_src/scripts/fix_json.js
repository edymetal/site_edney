import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../db/dados_acoes.json');

try {
    console.log(`Reading file: ${dbPath}`);
    let rawData = fs.readFileSync(dbPath, 'utf8');

    // Check if NaN exists
    if (rawData.includes('NaN')) {
        console.log('Found NaN values. Replacing with null...');
        // Replace NaN with null (without quotes, as NaN is a number type in JS but invalid in JSON)
        // However, in the text file it might appear as "NaN" or just NaN depending on how it was written.
        // Based on the grep output, it seems to be just NaN (unquoted) or part of a value.
        // Let's use a regex to be safe, but typically invalid JSON "NaN" is just the text NaN.

        // If it was written by Python's json.dump with allow_nan=True (default), it writes NaN.
        // We replace it with null.
        const sanitizedData = rawData.replace(/: NaN/g, ': null').replace(/:NaN/g, ': null');

        // Verify if it's valid JSON now
        JSON.parse(sanitizedData);

        fs.writeFileSync(dbPath, sanitizedData);
        console.log('File sanitized and saved successfully.');
    } else {
        console.log('No NaN values found.');
    }

} catch (error) {
    console.error('Error processing file:', error.message);
    process.exit(1);
}
