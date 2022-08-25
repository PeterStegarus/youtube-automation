class Video {
    constructor(id, title, category, url) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.url = url;
        this.fileName = `${id}.mp4`;
        this.uploaded = false;
    }
}

export default Video;