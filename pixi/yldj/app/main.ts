/****************** 导入 ******************/
//mod
import './stage';
import './rank';
import './prop';
import './adv';
import './revive';
import  './net';
//ui
import './widget/button';
import './widget/ani';
//local use
import User from './user';
import Process from './process';
import Connect from "../libs/ni/connect";
import '../libs/ni/music';
import Scene from '../libs/ni/scene';
import Loader from '../libs/ni/loader';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Main {
    constructor(cfg) {
        // console.log(cfg);
        let app = Scene.Application({
            width: cfg.screen.width,
            height: cfg.screen.height,  
            antialias: true,
            transparent: false,
            view: (window as any).canvas,
            resolution: 1,
            autoStart: false
        },cfg);
        Loader.add(["app/ui/","app/cfg/","audio/","images/","font/"],function(res){
            Connect.open(cfg,()=>{
                User.init();
                Process.clear();
            });
        },Process.add());
        // console.log(wx.env.USER_DATA_PATH);
    }
}
/****************** 本地 ******************/
declare const wx;