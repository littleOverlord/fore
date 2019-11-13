/****************** 导入 ******************/
import DB from '../ni/db';
import Connect from '../ni/connect';
import Emitter from '../ni/emitter';
import Fs from '../ni/fs';

/****************** 导出 ******************/
/**
 * @description
 * https://gc.hgame.com/user/getticketuserinfo?game_key=demo-game-2&timestamp=14332332&nonce=rand232&login_type=1&login_ticket=afd333&signature=222
 */
const login = (info) => {
    Connect.request({type:"app/xhb@login",arg:{
        "game_key":info.game_key,
        "game_url":info.game_url,
        "timestamp": info.timestamp,
        "nonce": info.nonce,
        "login_type":info.login_type,
        "login_ticket":info.ticket,
        "signature":info.signature,
        "gamename":Fs.appName
    }},(data) => {
        /**
         * data.info
         * {
            "avatar": "http://www.avatar.com/avatar.jpg", //始终是http格式
            "nickname": "魔界大神",
            "gender": 0 // 0 女, 1男
        }
         */
        if(data.err){
            status = 0;
            return console.log(data.err.reson);
        }
        entered = 0;
        DB.data.user.uid = data.ok.uid;
        DB.data.user.from = "xiaohuoban";
        DB.data.user.name = data.ok.name;
        DB.data.user.head = data.ok.head;
        DB.data.user.username = data.ok.username;
        DB.data.user.isnew = data.ok.regist;
        open_id = data.ok.username;
        successBack("xiaohuoban");
    })
    
}


/****************** 本地 ******************/
let userInfo:any 
// = {
//     game_key: "0a8dd6cbf338b9af",
//     game_url: "https%3A%2F%2Fgc.hgame.com%2Fhome%2Fgame%2Fappid%2F100021%2Fgameid%2F100611%3Fbar%3D%26from%3D",
//     login_type: "1",
//     nonce: "5VbpBD97n7EtQgnG",
//     signature: "8e6136b13a2dbf47a78861fe95a0536f495dda23",
//     ticket: "OPoaLs2rG9CU31jX",
//     timestamp: "1572709412"
// }
,
    wxButton,
    successBack,
    failBack,
    status,
    open_id,
    shareInfo:any = {},
    entered = 0,
    hGame = new (window as any).hGame({
        "game_key": '0a8dd6cbf338b9af'
    });
/**
 * @description 平台授权初始化
 */
const xhbLogin = () => {
    /**
     * 
     * @param data 小伙伴返回数据
     * {
     *  game_key ： 这里是游戏中心提供的game_key（required）
     *  timestamp ： 时间戳，1970-1-1至今秒数 （required）
     *  nonce ： 随机字符串（required）
     *  login_type： 表示ticket认证（required）， 值有两种： 1, 2，必须原样返回给游戏中心
     *  ticket ： 认证票据，用于获取游戏中心唯一用户，只能使用一次，获取之后先urldecode再进行签名计算。（required）
     *  game_url: 游戏url地址， 获取之后先urldecode再进行签名计算。（required)
     *  signature : 签名（required）
     * }
     */
    if(status){
        return;
    }
    status = 1;
    var callback = function(data){
        // 调用游戏登录接口
        // 进行票据验证，获取小伙伴游戏信息
        // 如 game.login(data);
        userInfo = data;
        login(data);
    }
    hGame.login(callback);
}

const connectClose = () => {
    if(wxButton){
        wxButton.destroy();
        wxButton = null;
    }
    status = 0;
}
/**
 * @description 分享回调
 * @param res 
 */
const shareback = (res) => {
    console.log(res)
    if(res.code == 0){
        shareInfo.callback && shareInfo.callback();
    }
    shareInfo.callback = null;
}
/**
 * @description 激活分享功能
 * @param open_id 
 */
const activeShare = () => {
    var data = {
        open_id: open_id,
        game_key:"0a8dd6cbf338b9af",
        message: shareInfo.title,
        shareKey: shareInfo.query//分享链接中携带信息
    }
    hGame.share(data, shareback);
}
/**
 * @description 组装基础数据
 */
const createBaseData = () => {
    return {
        "game_key":     '0a8dd6cbf338b9af',   //游戏平台提供的game_key
        "open_id":      DB.data.user.username,        //游戏平台提供的用户ID
        "role": `${DB.data.user.uid}`,            //游戏角色的唯一ID
        "nickname": DB.data.user.name,    //游戏中角色的昵称，没有昵称的可以传
        "area": 'HOODINN'    ,           //游戏区标志
        "group": '1'           //游戏服务器标志
    };
}

/**
 * @description 上报升级数据
 */
const addScore = (score: number) => {
    hGame.gameReport('levelUpgrade', createBaseData(), {
        "level":  score
    }, function(data){
        //这里是回调函数
        console.log(data);
    });
}
/**
 * @description 登录游戏时汇报数据
 */
const enterGame = (score: number) => {
    var extendData = {
        "level":  score, //整型，默认为0，当前等级
        "vipLevel": 0, //整型，默认为0，VIP等级
        "score": score, //整型，默认为0，战力、综合评分等
        "isNew": DB.data.user.isnew, //替代创建角色接口，如果是创建角色后第一次登录为1，默认为0
        "shareRole": 0, //分享来源,可以是roleid, 可以不填
    }
    hGame.gameReport('enterGame', createBaseData(), extendData, function(data){
        //这里是回调函数
        console.log(data);
    });
}
/****************** 立即执行 ******************/
/**
 * @description 主动分享
 */
Emitter.global.add("share",(arg)=>{
    activeShare();
})
/**
 * @description 设置分享信息
 */
Emitter.global.add("setShareInfo",(arg)=>{
    shareInfo = arg;
    hGame.setShareData({
        open_id: open_id,
        game_key:"0a8dd6cbf338b9af",
        message: shareInfo.title
    }, shareback);
})

Emitter.global.add("ptfromLogin",(param)=>{
    successBack = param.success;
    failBack = param.fail;
    xhbLogin();
    return true;
})

Emitter.global.add("readScore",()=>{
    if(entered == 0){
        enterGame(DB.data.score.history);
        entered = 1;
    }
})

DB.emitter.add("score.history",()=>{
    console.log(DB.data.user.username);
    if(DB.data.user.username == ""){
        return;
    }
    addScore(DB.data.score.history);
})
//通讯事件监听
Connect.notify.add("close",connectClose);
