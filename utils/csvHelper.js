const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Converts a raw file buffer from Multer into a parsed JSON array.
 * @param {Buffer} buffer - The file buffer from the uploaded CSV.
 * @returns {Promise<Array>} - Resolves with an array of objects.
 */
const parseCSVBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        // Create a readable stream from the memory buffer
        const stream = Readable.from(buffer);
        
        stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

module.exports = { parseCSVBuffer };