const path = require('path');
export class AppSettings{

    // I got this value from mobile app api request
    static clientId = "wGSpSAiKsam8CgBpYvClGBvPVJoLdgni6OpQnjR2";

    static maxFilenameLength = 50;

    //download path
    // if you change this path name, make sure to update gitignore file also
    static downloadPath =path.join('.','downloaded');
}