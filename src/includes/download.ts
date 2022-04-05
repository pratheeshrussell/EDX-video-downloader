import { ApiEndPoints } from "../constants/api";

const path = require('path');
const fs = require('fs');

const ProgressBar = require('progress');
const cheerio = require('cheerio');
const colors = require('colors');
const safeStringify = require('json-stringify-safe');


export class DownloadHelper{
    axios:any;
    cookiejar:any;
    constructor(axiosVars:any){
        this.axios = axiosVars.axios;
        this.cookiejar = axiosVars.cookiejar;
    }
    async downloadCourse(courseData:Object|any, initpath:string){
        if(courseData.hasOwnProperty("descendants") && courseData["descendants"]?.length > 0){
            // create folder and recurse
            let folderPath = path.join(initpath,courseData["name"]);
            await fs.promises.mkdir(folderPath, { recursive: true });
            for(let d = 0;d < courseData["descendants"].length; d++){
                this.downloadCourse(courseData["descendants"][d], folderPath);
            }
        } else {
            // check type and create - video or html or problem
            if(courseData["type"] == 'video'){
                if(courseData["video"]["url"] != ''){
                    await  this.downloadFile(courseData["video"]["url"], courseData["name"] + '.mp4', initpath);
                }
                if(courseData["video"]["srt"] != ''){
                    await this.downloadFile(courseData["video"]["srt"], courseData["name"] + '.srt', initpath);
                }
            }
            // Download the html for video also
            if(courseData["type"] == 'html' || courseData["type"] == 'video'){
                //Save as html
                await this.downloadHTML(courseData["studenturl"], courseData["name"] + '.html', initpath);
            }
            if(courseData["type"] == 'problem'){
                // See if possible to download problems
            }
        }
    }

    async downloadFile(url:string, filename:string, savepath:string){
        try{
        await fs.promises.mkdir(savepath, { recursive: true });
        const { data, headers } = await this.axios({
          url,
          method: 'GET',
          responseType: 'stream',
          jar: this.cookiejar,withCredentials: true,
          
        });
        const totalLength = headers['content-length'];
        let nameTrimmer = (inputName:string) =>{
            let split = inputName.split('.');
            return split.shift()?.substring(0, 4) + '.' + split.pop();
        }
      
        console.log("Downloading " + filename);
        const progressBar = new ProgressBar('-> '+nameTrimmer(filename)+' [:bar] :percent :etas', {
            width: 40,
            complete: '=',
            incomplete: ' ',
            renderThrottle: 1,
            total: parseInt(totalLength)
          });
      
        const writer = fs.createWriteStream(path.resolve(savepath, filename));

        data.on('data', (chunk: any | any[]) => {
            try {
                return progressBar.tick(chunk.length);
            } catch (e) {
                // NOT SURE WHY WE GET HERE
                console.log(colors.yellow("Status unknown " + filename));
                return 0;
            }
        });
        data.pipe(writer);
        } catch (e) {
            
            console.log(colors.red("Failed to download " + filename));
            fs.writeFile(path.resolve(savepath, filename + '.err.log'), safeStringify({ downurl: url, error: e}), 
            (err: any) => {
                if (err) {return; }
              });
              
        }
    }

    async downloadHTML(url:string, filename:string, savepath:string){
        console.log("Downloading " + filename);
        try{
            let res = await this.axios.get(url, {jar: this.cookiejar,withCredentials: true});
                if(res.status == 200){
                    // try to download assets
                    const $ = cheerio.load(res.data);
                    // all links
                    $('a').each(async (i:any, link:any)=>{
                        let asseturl:string =  $(link).attr('href').toString();
                        let assetName = asseturl.split('/').slice(-1).pop();
                        let assetpath = path.join(savepath , 'assets');
                        $(link).attr("href", './assets/'+assetName);// change local link path
                        if(asseturl.startsWith('/assets/') && assetName != undefined){
                            await this.downloadFile((ApiEndPoints.assetBaseUrl + asseturl),assetName!,assetpath);
                        }
                    });
                    // all images
                    $('img').each(async (i:any, img:any)=>{
                        let asseturl:string =  $(img).attr('src').toString();
                        let assetName = asseturl.split('/').slice(-1).pop();
                        let assetpath = path.join(savepath , 'assets');
                        $(img).attr("src", './assets/'+assetName);// change local link path
                        if(asseturl.startsWith('/assets/') && assetName != undefined){
                            await this.downloadFile((ApiEndPoints.assetBaseUrl + asseturl),assetName!,assetpath);
                        }
                    });
                    // save html
                    fs.writeFile(path.resolve(savepath, filename), $.html(), (err: any) => {
                        if (err) {
                          console.error(colors.red(err))
                          return
                        }
                      });
                } else {
                    throw new Error("Got status " + res.status);
                }
        } catch (e) {
            console.log(colors.red("Failed to download " + filename));
            fs.writeFile(path.resolve(savepath, filename + '.err.log'), safeStringify({ downurl: url, error: e}), 
            (err: any) => {
                if (err) {return; }
              });
              
        }
    }
}