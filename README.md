# EDX Video Downloader
I made this downloader to download a course for personal use. I didn't build it as a general purpose app, however it might help you to download course content.

## Steps to Run the program
* Run, `npm install`
* Edit index.ts and add your userEmail, password and also the courseId that you wish to download (you can download only enrolled courses)
* run, `npm run build` to generate the js files in the build folder
* finally run, `node '.\build\index.js'`
* files will be downloaded the *downloaded* folder
