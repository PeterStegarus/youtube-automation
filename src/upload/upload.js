import 'dotenv/config'
import * as fs from 'node:fs';
import { upload } from 'youtube-videos-uploader'

const DOWNLOAD_DIR = './videos';
const SCRAPE_DATA_PATH = './videos.json';

const scrapeData = JSON.parse(fs.readFileSync(SCRAPE_DATA_PATH));
console.log(scrapeData);

const files = fs.readdirSync(DOWNLOAD_DIR)
console.log(files);

const videos = scrapeData.videos.filter(video => video.uploaded == false)

const credentials = JSON.parse(process.env.CREDENTIALS);

console.log(credentials);

const uploadVideos = videos.map(video => ({
    path: `${DOWNLOAD_DIR}/${video.fileName}`,
    title: video.title,
    description: video.title
}))
console.log(uploadVideos);

for (const credential of credentials) {
    console.log(`Uploading in category [${credential.category}]`);
    const categoryVideos = uploadVideos.filter(video => video.category == credential.category);
    if (categoryVideos.length)
        await upload(credential, categoryVideos, { headless: false })
            .then((msg) => {
                console.log(msg);
                videos.forEach(video => {
                    if (video.category == credential.category) {
                        video.uploaded = true;
                    }
                })
            })
    else
        console.log("No new videos");
}

scrapeData.videos = videos;
fs.writeFileSync(SCRAPE_DATA_PATH, JSON.stringify(scrapeData), 'utf8');