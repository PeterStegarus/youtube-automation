import getDownloadUrl from './getdownloadurl.js'

const attemptGetDownloadUrl = async video => {
    if (video.attempts === undefined) video.attempts = 1;

    while (video.attempts < 5) {
        console.log(`Category [${video.category}], attempt [${video.attempts}]:`);
        await getDownloadUrl(video.url)
            .then(url => {
                console.log("success");
                video.attempts = undefined;
                return url;
            })
            .catch(e => {
                console.log(e.message);
                video.attempts++;
            });
    }

    video.attempts = undefined;
    return undefined;
}

export default attemptGetDownloadUrl;