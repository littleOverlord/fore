/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';
import DB from '../libs/ni/db';

import {AppEmitter} from './appEmitter';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Player {
    static init(){
        //创建顶部界面
        Scene.open("app-ui-mainTop",Scene.root);
        
    }
    static updateStageLevel(){
        if(!elements){
            return;
        }
        let node = elements.get("stage_level");
        node.text = `${DB.data.stage.level}-${DB.data.stage.fightCount}`;
        node.x = (208 - 16 * node.text.length)/2;
    }
}
/****************** 本地 ******************/
let elements;
class UiMainTop extends Widget{

    added(){
        console.log("UiMainTop add to the stage!");
        elements = this.elements;
        AppEmitter.emit("openTop",this.elements.get("fightScene"));
        Player.updateStageLevel();
    }
    destory(){
        console.log("UiMainTop remove from the stage!");
    }
}

/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-mainTop",UiMainTop);
//添加全局监听
AppEmitter.add("intoMain",Player.init);
DB.emitter.add("stage.level",Player.updateStageLevel);
DB.emitter.add("stage.fightCount",Player.updateStageLevel);