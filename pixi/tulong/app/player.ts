/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';

import {AppEmitter} from './appEmitter';
import Stage from './stage';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Player {
    static init(){
        //创建顶部界面
        Scene.open("app-ui-mainTop",Scene.root);
        Stage.init();
    }
    
}
/****************** 本地 ******************/
class UiMainTop extends Widget{

    added(){
        console.log("UiMainTop add to the stage!");
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