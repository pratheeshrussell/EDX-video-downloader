import { AppSettings } from "./constants/settings";
import { CourseDetails } from "./includes/course";
import { DownloadHelper } from "./includes/download";
import { userAuth } from "./includes/login";
const fs = require('fs');
// Axios setup
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

async function main() {
    // Edit Variables here
    let userEmail = "YOUR LOGIN EMAIL";
    let password = "YOUR PASSWORD";
    // Enter course id not url
    // if url is https://learning.edx.org/course/course-v1:DartmouthX+DART.ENGS.02.X+1T2022/home
    // id will be course-v1:DartmouthX+DART.ENGS.02.X+1T2022
    let courseId = "course-v1:DartmouthX+DART.ENGS.02.X+1T2022";

    /* ================================================================================================= */
    //Use the same axios instance everywhere
    const jar = new CookieJar();
    
    let axiosVars = {
        axios: wrapper(axios.create({ jar })),
        cookiejar:jar
    }
    // Login
    const user = new userAuth(userEmail,password,axiosVars);
    console.log("===Logging In ===");
    await user.login(); //if no error token should be set
    await user.getCSRF();
    console.log("===Fetching User Data ===");
    await user.getUserInfo();// user name should be fetched
    console.log("===Logged in as "+ user.user?.username +" ===");

    // Fetch course data
    const fetchCourse = new CourseDetails(user.token!.access_token,user.user!.username,courseId,axiosVars);
    let extractedLinks = await fetchCourse.fetch();
    // Download files
    const downloader = new DownloadHelper(axiosVars);
    downloader.downloadCourse(extractedLinks,AppSettings.downloadPath);
}

main();
