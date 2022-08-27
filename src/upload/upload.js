import 'dotenv/config'
import * as fs from 'node:fs';
import { upload } from 'youtube-videos-uploader'

const DOWNLOAD_DIR = './videos';
const SCRAPE_DATA_PATH = './videos.json';
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const PUPPETEER_OPTIONS = JSON.parse(process.env.PUPPETEER_OPTIONS);

const scrapeData = JSON.parse(fs.readFileSync(SCRAPE_DATA_PATH));

const videos = scrapeData.videos.filter(video => video.uploaded == false)

for (const credential of CREDENTIALS) {
    const categoryVideos = videos.filter(video => video.category == credential.category);
    const uploadVideos = categoryVideos.map(video => ({
        path: `${DOWNLOAD_DIR}/${video.fileName}`,
        title: video.title,
        description: video.title
    }))

    console.log(`Uploading ${uploadVideos.length} in category [${credential.category}]`);

    if (uploadVideos.length) {
        await upload(credential, uploadVideos, PUPPETEER_OPTIONS)
            .then(msg => {
                console.log(msg);
                categoryVideos.forEach(video => video.uploaded = true)
                fs.writeFileSync(SCRAPE_DATA_PATH, JSON.stringify(scrapeData), 'utf8');
            })
    }
    else {
        console.log("No new videos");
    }
}