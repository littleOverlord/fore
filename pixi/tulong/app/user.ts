/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';
import CfgMgr from '../libs/ni/cfgmrg';
import DB from '../libs/ni/db';
import Connect from '../libs/ni/connect';

/****************** 导出 ******************/
export default class User{
    /**
     * @description 平台名 "_default"没有任何平台 "wx"微信小游戏
     */
    static pt = "default"
    /**
     * @description 初始化平台授权，不是平台直接走默认登录
     * @param callback 
     */
    static init(callback){
        for(let k in ptFrom){
            if(ptFrom[k](callback)){
                return;
            }
        }
        setTimeout(callback,0);
    }
    /**
     * @description 登录
     */
    static login(callback){
        User[`login_${User.pt}`](callback);
    }
    /**
     * @description 微信登录
     */
    static login_wx(callback){
        let wxInfo,code,req = () => {
            if(wxInfo == undefined || !code){
                return;
            }
            Connect.request({type:"app/wx@login",arg:{
                "code":code,
                "info":wxInfo
            }},(data) => {
                if(data.err){
                    return console.log(data.err.reson);
                }
                DB.data.user.uid = data.ok.uid;
                DB.data.user.from = "wx";
                wxInfo && (DB.data.user.info = wxInfo);
                callback();
            })
        };
        (window as any).wx.getUserInfo({
            success(res) {
                wxInfo = res.userInfo;
            },
            fail(){
                wxInfo = "";
            },
            complete(){
                req();
            }
        });
        (window as any).wx.login({
            success(res) {
              if (res.code) {
                code = res.code;
                req();
              } else {
                callback("login fail");
              }
            }
        })
    }
    /**
     * @description 默认登录
     * @param callback 
     */
    static login_default(callback){

    }
}

/****************** 本地 ******************/
/**
 * @description 平台授权初始化
 */
const ptFrom = {
    wx: (callback) => {
        let wx = (window as any).wx;
        if(!wx){
            return false;
        }
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                    wx.authorize({
                        scope: 'scope.userInfo',
                        success() {
                            callback();
                        }
                    })
                }else{
                    callback();
                }
            }
        })
        return true;
    }
}

/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("user",{uid:0,info:{},from:""});