/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import Util from '../libs/ni/util';

import {Fighter as FighterCfg} from './ui/fighter';
import {AppEmitter} from './appEmitter';
import {Fighter, FScene} from './fight';

/****************** 导出 ******************/
/**
 * 关卡
 */
export default class Stage {
    static fightScene
    static init(){
        let f = Scene.create(FighterCfg,Scene.cache["fightScene"]);
        f.anchor.set(0.5,1);
        f.scale.x=-1;
        f.position.set(200,300);
        fightScene = new FScene();
        Frame.add(Stage.loop,50);
    }
    static loop(){
        let evs = fightScene.loop();
        for(let i = 0, len = evs.length; i < len; i++){
            eventHandler[evs[i][0]] && eventHandler[evs[i].type](evs[i]);
        }
    }
}
/****************** 本地 ******************/
//战斗场景
let fightScene: FScene;
//fighter显示列表
const fighterMap = {};
//战斗事件处理器列表
const eventHandler = {
    insert: function(e){
        let f = Util.copy(e[1]);
        f._show = Scene.create(FighterCfg,Scene.cache["fightScene"]);
        f._show.anchor.set(0.5,1);
        if(f.camp == 0){
            f._show.scale.x=-1;
        }
        f._show.position.set(f.x,f.y);

        fighterMap[f.id] = f;
    },
    move: (e) => {
        let f = fighterMap[e[1]];
        f.x = e[2][0];
        f._show.x = e[2][0];
    },
    damage: (e) => {
        let f = fighterMap[e[1]],
            t = fighterMap[e[2]];
        f._show.ni.animate = "attack";
        t._show.ni.animate = "behit"
    }
}

/****************** 立即执行 ******************/