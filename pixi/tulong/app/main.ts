/****************** 导入 ******************/
//mod
import './player';
import './stage';
import './equip';
import './store';
import  './net';
//ui
import './widget/tab';
import './widget/button';
import './widget/ani';
//local use
import User from './user';
import Connect from "../libs/ni/connect";
import '../libs/ni/music';
import Fs from '../libs/ni/fs';
import Scene from '../libs/ni/scene';
import Loader from '../libs/ni/loader';
import {AppEmitter} from './appEmitter';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Main {
    constructor(cfg) {
        console.log(cfg);
        let app = Scene.Application({
            width: cfg.screen.width,
            height: cfg.screen.height,  
            antialias: true,
            transparent: false,
            view: (window as any).canvas,
            resolution: 1
        },cfg);
        Loader.add(["app/ui/","app/cfg/","audio/","images/"],function(res){
            Connect.open(cfg,()=>{
                User.init(()=>{
                    User.login(()=>{
                        AppEmitter.emit("intoMain");
                    });
                });
            });
        });
        // console.log(wx.env.USER_DATA_PATH);
    }
}
/****************** 本地 ******************/
declare const canvas;
declare const wx;