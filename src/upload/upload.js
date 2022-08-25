import * as fs from 'node:fs';

const readvideos = JSON.parse(fs.readFileSync('videos.json'));
console.log(readvideos);

fs.readdir("videos", (err, files) => {
    console.log(files);
})