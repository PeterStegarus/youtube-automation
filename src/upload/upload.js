import 'dotenv/config'
import * as fs from 'node:fs';
import { upload as youtubeUpload, comment } from 'youtube-vids-uploader'

const DOWNLOAD_DIR = './videos';
const SCRAPE_DATA_PATH = './videos.json';
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const UPLOAD_ATTEMPTS = process.env.UPLOAD_ATTEMPTS;
const PUPPETEER_OPTIONS = JSON.parse(process.env.PUPPETEER_OPTIONS);
const DESCRIPTION_FOOTER = process.env.DESCRIPTION_FOOTER
const AFFILIATE_LINKS = JSON.parse(process.env.AFFILIATE_LINKS)


async function upload(maxCount) {
    const dir = fs.readdirSync(DOWNLOAD_DIR);

    const scrapeData = JSON.parse(fs.readFileSync(SCRAPE_DATA_PATH));
    scrapeData.videos.forEach(video => {
        if (!dir.includes(video.fileName))
            video.uploaded = true
    });

    const videos = scrapeData.videos.filter(video => video.uploaded == false)

    for (const credential of CREDENTIALS) {
        const affiliateLinks = [Math.random(), Math.random(), Math.random()]
            .map(random => Math.floor(random * AFFILIATE_LINKS.length))
            .map(index => AFFILIATE_LINKS[index])
            .map(link => `${link.title} - ${link.url}`)
            .join('\n\n');

        const categoryVideos = videos
            .filter(video => video.category == credential.category)
            .slice(0, maxCount);
        const uploadVideos = categoryVideos.map(video => {
            const description = `${affiliateLinks}\n\n${video.title}\n\n${DESCRIPTION_FOOTER}`

            const uploadVideo = {
                path: `${DOWNLOAD_DIR}/${video.fileName}`,
                title: video.title,
                description: description
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
                    const urls = await youtubeUpload(credential, uploadVideos.filter(video => video.path !== null), PUPPETEER_OPTIONS);
                    console.log(urls);
                    const comments = urls.map(url => ({ link: url.replace('shorts/', 'watch?v='), comment: affiliateLinks, pin: true }));
                    const commentsResult = await comment(credential, comments, PUPPETEER_OPTIONS).then(console.log());
                    console.log(commentsResult);
                    break;
                } catch (e) {
                    console.log(`${credential.category}: ${e.message} - Attempt ${attempts} / ${UPLOAD_ATTEMPTS}`);
                    attempts++;
                }
            }
        }
        else {
            console.log('No new videos');
        }
    }
}

export default upload