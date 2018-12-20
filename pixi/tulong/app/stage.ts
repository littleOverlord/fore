/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';

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
        Stage.fightScene = new FScene();
        Frame.add(Stage.loop,50);
    }
    static loop(){
        let evs = Stage.fightScene.loop();
    }
}
/****************** 本地 ******************/
const eventHandler = {
    insert: function(){

    }
}

/****************** 立即执行 ******************/