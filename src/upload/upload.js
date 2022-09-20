import 'dotenv/config'
import * as fs from 'node:fs';
import { upload } from 'youtube-vids-uploader'

const DOWNLOAD_DIR = './videos';
const SCRAPE_DATA_PATH = './videos.json';
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const UPLOAD_ATTEMPTS = 1;
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
    const uploadVideos = categoryVideos.map(video => {
        const uploadVideo = {
            path: `${DOWNLOAD_DIR}/${video.fileName}`,
            title: video.title,
            description: video.title
        }

        uploadVideo.onSuccess = () => {
            console.log(`${uploadVideo.path} - Success`);
            video.uploaded = true;
            fs.writeFileSync(SCRAPE_DATA_PATH, JSON.stringify(scrapeData), 'utf8');
            fs.unlinkSync(uploadVideo.path);
            uploadVideo.path = null;
        }

        return uploadVideo;
    })

    console.log(`Uploading ${uploadVideos.length} in category [${credential.category}]`);

    if (uploadVideos.length) {
        console.log(uploadVideos.map(video => video.path));

        let attempts = 1;
        while (attempts <= UPLOAD_ATTEMPTS) {
            try {
                console.log(await upload(credential, uploadVideos.filter(video => video.path !== null), PUPPETEER_OPTIONS));
                break;
            } catch (e) {
                console.log(`${credential.category}: ${e.message} - Attempt ${attempts} / ${UPLOAD_ATTEMPTS}`);
                attempts++;
            }
        }
    }
    else {
        console.log("No new videos");
    }
}