import { default as Axios } from 'axios'
import { load } from 'cheerio'
import { stringify } from 'qs'

const getDownloadUrl = url => {
    return new Promise((resolve, reject) => {
        console.log(`Getting download url for ${url}`);
        Axios.get('https://ttdownloader.com/').then((data) => {
            console.log('fetch data get success');
            const $ = load(data.data)
            const cookie = data.headers['set-cookie'].join('')
            const dataPost = {
                url: url,
                format: '',
                token: $('#token').attr('value')
            }
            console.log('start data post');
            Axios({
                method: 'POST',
                url: 'https://ttdownloader.com/query/',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    origin: 'https://ttdownloader.com',
                    referer: 'https://ttdownloader.com/',
                    cookie: cookie,
                },
                data: stringify(dataPost)
            }).then(({ data }) => {
                console.log('fetch data post success');
                const $ = load(data)
                const result = $('#results-list > div:nth-child(2) > div.download > a')?.attr('href');
                console.log(result);
                resolve(result);
            }).catch(e => {
                reject({ status: false, message: 'error fetch data post', e: e.message })
            })
        }).catch(e => {
            reject({ status: false, message: 'error fetch data get', e: e.message })
        })
    })
}

export default getDownloadUrl;