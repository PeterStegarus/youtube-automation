import 'dotenv/config'
import { hashtag } from 'tiktok-scraper';
import * as fs from 'node:fs';

import Video from '../models/video.js'
import getDownloadUrl from './getdownloadurl.js'
import downloadVideo from './downloadvideo.js';

const CATEGORIES_NAMES = JSON.parse(process.env.CATEGORIES);
const SCRAPE_DATA_PATH = './videos.json';
const SESSIONS_LIST = ['sid_tt=asdasd13123123123adasda;'];

let scrapeData = { scrapeNumber: 1, videos: [] }
if (fs.existsSync(SCRAPE_DATA_PATH))
    scrapeData = JSON.parse(fs.readFileSync(SCRAPE_DATA_PATH));

const scrapeOptions = { number: scrapeData.scrapeNumber, sessionList: SESSIONS_LIST }

const metadataPromises = CATEGORIES_NAMES.map(category => hashtag(category, scrapeOptions));
const metadata = (await Promise.all(metadataPromises)).map(category => category.collector);

const postsByCategory = metadata
    .map((category, index) => category
        .filter(post => !scrapeData.videos.some(video => video.id == post.id))
        .map(post => new Video(
            post.id,
            post.text,
            CATEGORIES_NAMES[index],
            post.webVideoUrl
        )));
const videos = postsByCategory.flat()

const downloadUrls = [];

// This needs to be done sequentially. Tried using Promise.all but got hit with 503 errors
for (const video of videos) {
    const downloadUrl = await getDownloadUrl(video.url);
    downloadUrls.push(downloadUrl)
}

const downloadPromises = downloadUrls.map((url, index) => downloadVideo(url, videos[index].fileName));
await Promise.all(downloadPromises);

scrapeData.scrapeNumber++;
scrapeData.videos.push(...videos);
fs.writeFileSync(SCRAPE_DATA_PATH, JSON.stringify(scrapeData), 'utf8');