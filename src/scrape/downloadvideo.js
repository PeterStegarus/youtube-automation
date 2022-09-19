import fetch from 'node-fetch'
import * as fs from 'node:fs';

const DOWNLOAD_DIR = './videos';

async function downloadVideo(url, fileName) {
    if (url === undefined || url === null) {
        return;
    }

    console.log(`${fileName} - Downloading: ${url}`);
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR);
    }

    const path = `${DOWNLOAD_DIR}/${fileName}`;

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        fs.writeFileSync(path, Buffer.from(arrayBuffer));
        console.log(`${fileName}: Success`);
    } catch (e) {
        console.log(`${fileName}: Skipped`);
    }
}

export default downloadVideo