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
     * @description 平台用户信息
     */
    static info
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
        let code,req = () => {
            if(User.info == undefined || !code){
                return;
            }
            Connect.request({type:"app/wx@login",arg:{
                "code":code,
                "info":User.info
            }},(data) => {
                if(data.err){
                    return console.log(data.err.reson);
                }
                DB.data.user.uid = data.ok.uid;
                DB.data.user.from = "wx";
                User.info && (DB.data.user.info = User.info);
                callback();
            })
        };
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
        let wx = (window as any).wx,createButton = () => {
            var button = wx.createUserInfoButton({type: 'text',text: '点击进入游戏',style:{left: wx.getSystemInfoSync().windowWidth/2-70,bottom: wx.getSystemInfoSync().windowHeight/2,width: 140,height: 40,lineHeight: 40,backgroundColor: '#ff0000',color: '#ffffff',textAlign: 'center',fontSize: 16,borderRadius: 4}})
            button.onTap((res) =>{
                if(res.errMsg=="getUserInfo:ok"){console.log("授权用户信息")//获取到用户信息
                    User.info = res.userInfo;
                    callback();
                    //清除微信授权按钮
                    button.destroy()
                }else{
                    console.log("授权失败")
                }
            })
        };
        if(!wx){
            return false;
        }
        User.pt = "wx";
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                    createButton();
                }else{
                    wx.getUserInfo({
                        success(res) {
                            User.info = res.userInfo;
                        },
                        fail(){
                            User.info = "";
                        },
                        complete(){
                            callback();
                        }
                    });
                }
            }
        })
        return true;
    }
}

/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("user",{uid:0,info:{},from:""});