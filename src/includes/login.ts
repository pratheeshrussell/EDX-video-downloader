import { ApiEndPoints } from "../constants/api";
import { AppSettings } from "../constants/settings";
import { TokenModel } from "../models/token.model";
import { UserModel } from "../models/user.model";

export class userAuth{
    private username;
    private password;

    token: TokenModel | undefined;
    user: UserModel | undefined;
    csrftoken:string | undefined;
    axios:any;
    cookiejar:any;

    constructor(username:string, password:string, axiosVars:any){
        this.axios = axiosVars.axios;
        this.cookiejar = axiosVars.cookiejar;
        this.axios.defaults.withCredentials = true;
        this.username = username;
        this.password = password;
    }
    
    async login(){
        if(this.username != null && this.username != "" && this.password != null && this.password != ""){
            const bodyContent = 'grant_type=password&client_id='+ AppSettings.clientId
            +'&username='+encodeURIComponent(this.username)+'&password='+encodeURIComponent(this.password);
            const headers = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
            try {
                let res = await this.axios.post(ApiEndPoints.accessToken, bodyContent, 
                    {headers: headers,jar: this.cookiejar,withCredentials: true});
                    if(res.status == 200){
                        this.token = res.data;
                    } else {
                        throw new Error("Login failed");
                    }
            }catch (error) {
                throw new Error("Unable to login " + error);
            }
        } else {
            throw new Error("User email/password is null/empty");
        }
    }

    async getCSRF(){
        if(this.token!.access_token == undefined){
            throw new Error("Token not found");
        }
        const headers = {
            'Authorization': 'Bearer ' + this.token?.access_token,
            'Content-Type':'text/plain',
            'Host': 'courses.edx.org'
        };
        try {
            let res = await this.axios.post(ApiEndPoints.csrfCookie, '',{headers: headers,jar: this.cookiejar,withCredentials: true});
                if(res.status == 204){
                    let cookieData:string[] = res["headers"]['set-cookie'];
                    cookieData.forEach((cookie)=>{
                        if(cookie.toLowerCase().includes('csrftoken=')){
                            this.csrftoken = cookie;
                        }
                    }); 
                } else {
                    throw new Error("CSRF not obtained");
                }
        }catch (error) {
            throw new Error("No csrf available " + error);
        }
    }

    async getUserInfo(){
        if(this.token!.access_token == undefined){
            throw new Error("Token not found");
        }
        const headers = {'Authorization': 'Bearer ' + this.token?.access_token};
        try {
            let res = await this.axios.get(ApiEndPoints.getUserInfo, {headers: headers,jar: this.cookiejar,withCredentials: true});
                    if(res.status == 200){
                        this.user = res.data;
                    } else {
                        throw new Error("Unable to get username");
                    }
        }catch (error) {
            throw new Error("Error getting username " + error);
        }
    }
}