import { ApiEndPoints } from "../constants/api";

const _ = require('lodash');
import filenamify = require('filenamify');
import { AppSettings } from "../constants/settings";

export class CourseDetails{
    token:string;
    username:string;
    courseid: string;
    axios:any;
    cookiejar:any;
    constructor(token:string, username:string,courseid: string,axiosVars:any){
        this.axios = axiosVars.axios;
        this.cookiejar = axiosVars.cookiejar;
        this.username = username;
        this.token = token;
        this.courseid = courseid;
    }
    async fetch(){
        const url = ApiEndPoints.getCourseData(this.username,this.courseid);
        const headers = {'Authorization': 'Bearer ' + this.token};
        try {
            let res = await this.axios.get(url, {headers: headers,jar: this.cookiejar,withCredentials: true});
                    if(res.status == 200){
                       // should contain the extracted links
                       return this.processCourseData(res.data["root"],res.data["blocks"]);
                    } else {
                        throw new Error("Unable to fetch course data");
                    }
        }catch (error) {
            throw new Error("Error getting course data " + error);
        }
    }

    processCourseData(rootnode:string,blocksData:any){
        //Extract video links
        let structuredLinks = {};

       let tmpblocksData = _.cloneDeep(blocksData);
       //DONOT Deep clone within the loop
       for (let node of Object.keys(tmpblocksData)) {
           let tmpDescendants = [];
           if(tmpblocksData[node].hasOwnProperty("descendants")){
            tmpDescendants.push(...tmpblocksData[node]["descendants"]);
            tmpblocksData[node]["descendants"] = [];
            for(let descendant =0;descendant < tmpDescendants.length;descendant++){
                let descBlock = tmpblocksData[tmpDescendants[descendant]];
                tmpblocksData[node]["descendants"].push(this.processCourseBlock(descBlock, ((descendant+1).toString() + '_')));
            }
           }
       }
        structuredLinks = this.processCourseBlock(tmpblocksData[rootnode]);
        return _.cloneDeep(structuredLinks);
    }

    processCourseBlock(block:any,prefix=''){
        let tmpBlock = {
            // Replacing Space with underscore and removing special characters
            // doing this since it will be used as file name
            name:prefix + filenamify(block["display_name"].replace(/ /g, '_'), {replacement: '',maxLength: AppSettings.maxFilenameLength}),
            type: block["type"],
            studenturl: block["student_view_url"],
            video:{
                srt:'',
                url:''
            },
            descendants:block["descendants"]
        }
        if (block.hasOwnProperty("student_view_data") && block["student_view_data"].hasOwnProperty("encoded_videos")) {
            // get video
            if(block["student_view_data"]["encoded_videos"].hasOwnProperty("desktop_mp4")){
                tmpBlock.video.url = block["student_view_data"]["encoded_videos"]["desktop_mp4"]["url"];
            } else if(block["student_view_data"]["encoded_videos"].hasOwnProperty("mobile_high")){
                tmpBlock.video.url = block["student_view_data"]["encoded_videos"]["mobile_high"]["url"];
            }else if(block["student_view_data"]["encoded_videos"].hasOwnProperty("mobile_low")){
                tmpBlock.video.url = block["student_view_data"]["encoded_videos"]["mobile_low"]["url"];
            }
        }

        if (block.hasOwnProperty("student_view_data") && block["student_view_data"].hasOwnProperty("transcripts")) {
            // get srt
            if(block["student_view_data"]["transcripts"].hasOwnProperty("en")){
                tmpBlock.video.srt = block["student_view_data"]["transcripts"]["en"];
            }
        }
        return tmpBlock;
    }
}