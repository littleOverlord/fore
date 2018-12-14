/****************** 导入 ******************/
import Scene from '../libs/ni/scene';

import {UiMainTop} from './ui/mainTop';
import {AppEmitter} from './appEmitter';
import Stage from './stage';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Player {
    static init(){
        //创建顶部界面
        Scene.create(UiMainTop,Scene.root);
        // Scene.create(FighterCfg,Scene.cache["fightScene"]);
        Stage.init();
    }
}
/****************** 立即执行 ******************/
AppEmitter.add("intoMain",Player.init);