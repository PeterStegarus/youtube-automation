import 'dotenv/config'
import * as fs from 'node:fs';
import { upload } from 'youtube-vids-uploader'

const DOWNLOAD_DIR = './videos';
const SCRAPE_DATA_PATH = './videos.json';
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const UPLOAD_ATTEMPTS = 2;
const PUPPETEER_OPTIONS = JSON.parse(process.env.PUPPETEER_OPTIONS);

const dir = fs.readdirSync(DOWNLOAD_DIR);

const scrapeData = JSON.parse(fs.readFileSync(SCRAPE_DATA_PATH));
scrapeData.videos.forEach(video => {
    if (!dir.includes(video.fileName))
        video.uploaded = true
});

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
        console.log(uploadVideos.map(video => video.path));
        console.log(await upload(credential, uploadVideos, PUPPETEER_OPTIONS));

        let attempts = UPLOAD_ATTEMPTS;
        while (attempts) {
            try {
                categoryVideos.forEach(video => video.uploaded = true)
                uploadVideos.forEach(video => fs.unlinkSync(video.path));
                fs.writeFileSync(SCRAPE_DATA_PATH, JSON.stringify(scrapeData), 'utf8');
                break;
            } catch (e) {
                console.log(`${credential.category}: ${e.message} - Attempt ${attempts} / ${UPLOAD_ATTEMPTS}`);
                attempts--;
            }
        }
    }
    else {
        console.log("No new videos");
    }
}