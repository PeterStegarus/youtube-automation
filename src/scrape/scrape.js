import 'dotenv/config'
import { hashtag } from 'tiktok-scraper';
import * as fs from 'node:fs';

import Video from '../models/video.js'
import downloadVideo from './downloadvideo.js';
import attemptGetDownloadUrl from './attemptgetdownloadurl.js';

const CATEGORIES = JSON.parse(process.env.CREDENTIALS).map(credential => credential.category);
const SCRAPE_DATA_PATH = './videos.json';
const SESSIONS_LIST = ['sid_tt=asdasd13123123123adasda;'];
const invalidCharacters = '/[<>]/g';

export default async () => {
    let scrapeData = { scrapeNumber: 1, videos: [] }
    if (fs.existsSync(SCRAPE_DATA_PATH))
        scrapeData = JSON.parse(fs.readFileSync(SCRAPE_DATA_PATH));

    const scrapeOptions = { number: scrapeData.scrapeNumber, sessionList: SESSIONS_LIST }

    const metadataPromises = CATEGORIES.map(category => hashtag(category, scrapeOptions));
    const metadata = (await Promise.all(metadataPromises)).map(category => category.collector);

    const postsByCategory = metadata
        .map((category, index) => category
            .filter(post => !scrapeData.videos.some(video => video.id == post.id))
            .map(post => new Video(
                post.id,
                post.text.replace(invalidCharacters, ''),
                CATEGORIES[index],
                post.webVideoUrl
            )));
    const videos = postsByCategory.flat()

    // This needs to be done sequentially. Tried using Promise.all but got hit with http 503 errors
    const downloadUrls = [];
    for (const video of videos) {
        const url = await attemptGetDownloadUrl(video);
        downloadUrls.push(url);
    }

    const downloadPromises = downloadUrls.map((url, index) => downloadVideo(url, videos[index].fileName));
    await Promise.all(downloadPromises);

    scrapeData.scrapeNumber++;
    scrapeData.videos.push(...videos);
    fs.writeFileSync(SCRAPE_DATA_PATH, JSON.stringify(scrapeData), 'utf8');
}