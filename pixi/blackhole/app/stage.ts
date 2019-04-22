/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import Util from '../libs/ni/util';
import CfgMgr from '../libs/ni/cfgmrg';
import TextAnimate from "../libs/ni/textani";
import Connect from "../libs/ni/connect";
import DB from "../libs/ni/db";

import {AppEmitter} from './appEmitter';

/****************** 导出 ******************/
/**
 * 关卡
 */
export default class Stage {
    
}
/****************** 本地 ******************/

/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("stage",{level:1,fightCount:0,lastFightTime:0});

//注册页面打开事件
AppEmitter.add("openTop",(node)=>{
    
});