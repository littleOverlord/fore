/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';
import Fs from '../libs/ni/fs';
import DB from '../libs/ni/db';
import Music from '../libs/ni/music';
import Connect from '../libs/ni/connect';
import Emitter from '../libs/ni/emitter';
import Hash from "../libs/ni/sha512";

/****************** 导出 ******************/
export default class User{
    /**
     * @description 平台名 "_default"没有任何平台 "wx"微信小游戏
     */
    static pt = "xianquyouxi"
    /**
     * @description 平台用户信息
     */
    static info
    /**
     * @description wx 登录code
     */
    static code
    /**
     * @description 用户界面渲染对象
     */
    static show
    static ptButton
    /**
     * @description 初始化平台授权，不是平台直接走默认登录
     * @param callback 
     */
    static init(){
        // 检查是否由平台创建登录按钮
        let pfResult = Emitter.global.emit("ptfromUser",{
            success: (ptName) => {
                User.pt = ptName;
                loginCallback(null);
            },
            fail: () => {
                initLocal(loginCallback);
            }
        });
        User.ptButton = pfResult[0];
        Emitter.global.emit("intoMain");
        User.show = Scene.open("app-ui-user",Scene.root);
    }
}

/****************** 本地 ******************/
/**
 * @description 用户组件
 */
class WUser extends Widget{
    setProps(){
        if(User.ptButton){
            this.cfg.children.splice(1,1);
        }
        
    }
    added(node){
        // let btn = node.children[1].children[0];
        // let wx = (window as any).wx;
        // if(wx){
        //     btn.ni.left = 3000;
        // }
    }
    login(){
        Music.play("audio/butn.mp3");
        let pfResult = Emitter.global.emit("ptfromLogin",{
            success: (ptName) => {
                User.pt = ptName;
                loginCallback(null);
            },
            fail: () => {
                initLocal(loginCallback);
            }
        });
        if(!pfResult[0]){
            initLocal(loginCallback);
        }
    }
}
/**
 * @description 无平台注册
 * @param account 账号
 * @param password 密码
 * @param callback 登录回调
 */
const regist = (account: string, password: string, callback: Function) => {
    Connect.request({type:"app/user@regist",arg:{name: account, psw: password, from: User.pt, gamename: Fs.appName}},(data) => {
        if(data.err){
            console.log("regist err::"+data.err.reson);
            return callback(data.err.reson);
        }
        DB.data.user.uid = data.ok.uid;
        DB.data.user.from = User.pt;
        DB.data.user.username = data.ok.username;
        DB.data.user.isnew = 1;
        localStorage.setItem("userInfo",`{"account":"${account}","encryPassword":"${password}"}`);
        callback();
    })
}
/**
 * @description 无平台登录
 * @param account 账号
 * @param password 密码
 * @param callback 登录回调
 */
const login = (account: string, password: string, callback: Function) => {
    Connect.request({type:"app/user@login",arg:{name: account, psw: password, gamename: Fs.appName}},(data) => {
        if(data.err){
            console.log("login err::"+data.err.reson);
            return callback(data.err.reson);
        }
        DB.data.user.uid = data.ok.uid;
        DB.data.user.from = data.ok.from;
        DB.data.user.username = data.ok.username;
        DB.data.user.isnew = 0;
        callback();
    })
}
/**
 * @description 登录回调
 * @param err 错误信息
 */
const loginCallback = (err) => {
    if(err){
        return console.log(err);
    }
    Emitter.global.emit("selectProp");
    Emitter.global.emit("login");
    Scene.remove(User.show);
    User.show = null;
}
/**
 * @description 计算哈希
 */
const caclHash = (s: string, type: string): string => {
    let sha512 = new Hash("SHA-512", "TEXT");
    sha512.update(s);
    return sha512.getHash(type);
}
/**
 * @description 合并字符串
 */
const blendStrig = (s1: string,s2: string): string =>{
    let s = "",len = Math.max(s1.length, s2.length);
    for(let i = 0; i < len; i++){
        s += `${s1[i]||""}${s2[i]||""}`;
    }
    return s;
}
/**
 * @description 密码加密
 */
const encryptPassword = (ps: string): string => {
    let b64 = caclHash(ps,"B64"),
        hex = caclHash(ps,"HEX");
    ps = caclHash(blendStrig(b64.substr(0,b64.length-2), hex),"B64");
    // console.log(b64,hex,ps);
    return ps;
}
/**
 * @description 注册登录
 */
const initLocal = (callback) => {
    let userInfomation = localStorage.getItem("userInfo")?JSON.parse(localStorage.getItem("userInfo")):null,len = 12;//账号和密码的长度
    
    if(userInfomation ){      
        login(userInfomation.account,userInfomation.encryPassword,(err)=>{
            if(err){
                localStorage.setItem("userInfo","0");
                return initLocal(callback);
            }
            callback();
        });      
    }else{
        userInfomation = {};
        let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789",//账号密码可用字符
        symbol = " `~!@#$%^&*()_+-={}|[]\\:\";'<>?,./";//密码可用的附加字符
        userInfomation.account = getStr(str,len);//生成账号
        userInfomation.encryPassword = encryptPassword( getStr(str+symbol,len) );//密码加密
        
        regist(userInfomation.account,userInfomation.encryPassword,callback);
    }
}
//根据给的字符串序列生成随机字符串
const getStr = (s,len) => {
    let rule = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789",
    str="";
    s = s || rule;
    let strLen = s.length;
    for(let i=0;i<len;i++){
        let index = Math.floor(Math.random()*strLen);
        str += s[index];
    }
    return str;
}
const connectClose = () => {
    if(User.show){
        Scene.remove(User.show);
        User.show = null;
    }
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("user",{uid:0,username:"",info:{},from:"",name:"",head:"",isnew:1});

//注册组件
Widget.registW("app-ui-user",WUser);

//通讯事件监听
Connect.notify.add("close",connectClose);