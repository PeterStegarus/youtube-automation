import getDownloadUrl from './getdownloadurl.js'
const MAX_ATTEMPTS = 5

const attemptGetDownloadUrl = async video => {
    if (video.attempts === undefined) video.attempts = 1;

    while (video.attempts <= MAX_ATTEMPTS) {
        console.log(`Category [${video.category}], attempt [${video.attempts}]:`);
        try {
            const downloadUrl = await getDownloadUrl(video.url);
            video.attempts = undefined;
            console.log("success");
            return downloadUrl;
        } catch (e) {
            console.log(e.message);
            video.attempts++;
        }
    }

    video.attempts = undefined;
    return undefined;
}

export default attemptGetDownloadUrl;