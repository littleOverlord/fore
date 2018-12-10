/****************** 导入 ******************/
import Emitter from '../libs/ni/emitter';
import Scene from '../libs/ni/scene';

import {UiMainTop} from './ui/mainTop';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Player {
    static init(){
        //创建顶部界面
        Scene.create(UiMainTop,Scene.root);
    }
}
/****************** 立即执行 ******************/
Emitter.add("intoMain",Player.init);