import fetch from 'node-fetch'
import * as fs from 'node:fs';

const DOWNLOAD_DIR = './videos';

async function downloadVideo(url, fileName) {
    if (url === undefined || url === null) {
        return;
    }

    console.log(`Downloading ${url}`);
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR);
    }

    const path = `${DOWNLOAD_DIR}/${fileName}`;

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    fs.writeFile(path, Buffer.from(arrayBuffer), (err) => {
        if (err) console.log(err);
    });
}

export default downloadVideo