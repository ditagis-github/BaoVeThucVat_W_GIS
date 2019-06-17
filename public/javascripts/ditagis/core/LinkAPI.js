define([], function () {
    // var gisapi_url = "https://gis.genco3.com/gisapi/";
    var gisapi_url = "https://ditagis.com/genco3/";
    const linkAPI = {
        ACCOUNT_PROFILE: gisapi_url + "api/Account/Profile",
        CAMERA:gisapi_url +  "api/Camera/",
        LOGIN: gisapi_url + "api/Login",
        CONGSUAT:gisapi_url + "congsuat/",
        THOITIET_THONGTINMOITRUONG:gisapi_url + 'thongtinmoitruong/',
        LAYER_INFOS:gisapi_url + "api/layerinfo",
        MADOITUONG:gisapi_url + "api/gis/LayMaDoiTuong"


        
    };
    const linkAPI1 = {
        ACCOUNT_PROFILE:"https://ditagis.com/genco3/api/Account/Profile",
        CAMERA: "https://ditagis.com/genco3/api/Camera/",
        LOGIN:"https://ditagis.com/genco3/api/Login",
        CONGSUAT:"https://ditagis.com/genco3/congsuat/",
        THOITIET_THONGTINMOITRUONG:'https://ditagis.com/genco3/thongtinmoitruong/',
        LAYER_INFOS:"https://ditagis.com/genco3/api/layerinfo",
        MADOITUONG:"https://ditagis.com/genco3/api/gis/LayMaDoiTuong"


        
    };
    return linkAPI;
});
