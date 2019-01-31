/****************** 导入 ******************/
//mod
import './player'
import './stage'
import './equip'
import './store'
//ui
import './ui/tab'
import './ui/button'
import './ui/ani'
//local use
import  './net';
import Scene from '../libs/ni/scene';
import Loader from '../libs/ni/loader';
import CfgMgr from '../libs/ni/cfgmrg';
import Widget from '../libs/ni/widget';
import {AppEmitter} from './appEmitter';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Main {
    constructor(cfg) {
        let loadCount = 4,
            spriteSheetsData,
            cfgData,
            uiData,
            loadOk = function(){
                if(loadCount == 0){
                    Scene.createSpriteSheets(spriteSheetsData);
                    CfgMgr.add(cfgData);
                    Widget.registC(uiData);
                    AppEmitter.emit("intoMain");
                }
            };
        console.log(cfg);
        let app = Scene.Application({
            width: cfg.screen.width,
            height: cfg.screen.height,  
            antialias: true,
            transparent: false,
            view: canvas,
            resolution: 1
        },cfg);
        Loader.add(["images/ui.png","images/ani/M_S_043.png","images/ani/M_S_044.png","images/ani/M_S_002.png","images/arms.png","images/armors.png","images/ua/equip_light.png"],function(){
            loadCount -= 1;
            loadOk();
        });
        Loader.loadJson(["images/ani/M_S_043.json","images/ani/M_S_044.json","images/ani/M_S_002.json","images/ui.json","images/arms.json","images/armors.json","images/ua/equip_light.json"],function(res){
            console.log(res);
            spriteSheetsData = res;
            loadCount -= 1;
            loadOk();
        });
        Loader.loadJson(["app/cfg/pve.json"],function(res){
            console.log(res);
            cfgData = res;
            loadCount -= 1;
            loadOk();
        });
        Loader.loadJson(["app/ui/mainTop.json","app/ui/mainBottom.json","app/ui/tab.json","app/ui/equip.json","app/ui/equipCon.json","app/ui/equipBg.json","app/ui/button.json","app/ui/ani.json","app/ui/fastBuy.json"],function(res){
            console.log(res);
            uiData = res;
            loadCount -= 1;
            loadOk();
        });
        console.log(app);
    }
}
/****************** 本地 ******************/
declare const canvas;