/****************** 导入 ******************/
import Emitter from '../libs/ni/emitter';
import Scene from '../libs/ni/scene';

import {UiMainBottom} from './ui/mainBottom';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Equip {
    static currTab = 0
    /**
     * @description 初始化装备界面
     */
    static init(){
        //创建顶部界面
        Scene.create(UiMainBottom,Scene.root);
        Scene.modifyTexture("bag_tab_attack","images/ui/bag_tab_curr.png");
        
        //给按钮绑定事件
        Scene.bindEvent("fast_buy","tap",Equip.fastBuy);
        Scene.bindEvent("button_store","tap",Equip.openStore);
        Scene.bindEvent("bag_tab_attack","tap",function(){
            Equip.bagTab(0);
        });
        Scene.bindEvent("bag_tab_armors","tap",function(){
            Equip.bagTab(1);
        });
    }
    /**
     * @description 响应快速购买
     */
    static fastBuy(e){
        console.log(`tap fast_buy button~~`,e);
    }
    /**
     * @description 打开商店界面
     */
    static openStore(e){
        console.log(`tap button_store button~~`,e);
    }
    /**
     * @
     */
    static bagTab(index){
        if(this.currTab === index){
            return;
        }
        const els = ["bag_tab_attack","bag_tab_armors"];
        Scene.modifyTexture(els[index],"images/ui/bag_tab_curr.png");
        Scene.modifyTexture(els[Math.abs(index-1)],"images/ui/bag_tab_bg.png");
        this.currTab = index;
    }
}
/****************** 本地 ******************/

/****************** 立即执行 ******************/
Emitter.add("intoMain",Equip.init);