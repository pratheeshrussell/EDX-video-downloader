export class ApiEndPoints{
    static accessToken = "https://courses.edx.org/oauth2/access_token/";
    static csrfCookie = "https://courses.edx.org/oauth2/login/";

    static getUserInfo = "https://courses.edx.org/api/mobile/v1/my_user_info";

    static assetBaseUrl = "https://courses.edx.org/";
    
    static getCourseData = (username:string,courseid:string) => {
        return "https://courses.edx.org/api/courses/v2/blocks/?requested_fields=student_view_multi_device&student_view_data=video,html&block_counts=video,html&nav_depth=3&username="
        +encodeURIComponent(username)+"&course_id="+encodeURIComponent(courseid)+"&depth=all";
    }
    
    
}
