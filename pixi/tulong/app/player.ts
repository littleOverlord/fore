/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';
import Connect from "../libs/ni/connect";
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
        Player.read();
    }
    /**
     * @description 更新关卡等级
     */
    static updateStageLevel(){
        if(!elements || !DB.data.stage){
            return;
        }
        let node = elements.get("stage_level");
        node.text = `${DB.data.stage.level}-${DB.data.stage.fightCount}`;
        node.x = (208 - 16 * node.text.length)/2;
    }
    /**
     * @description 更新金币
     * @param money 
     */
    static addMoney(money){
        DB.data.player.money = money;
        let node = elements.get("token_money");
        node.text = `${money}`;
        node.x = (208 - 16 * node.text.length)/2;
        console.log("update money ",money);
    }
    static read(){
        Connect.request({type:"app/player@read",arg:{}},(data) => {
            if(data.err){
                return console.log(data.err.reson);
            }
            Player.addMoney(data.ok.money);
        })
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
//初始化玩家数据库表
DB.init("player",{money:1});
//注册组件
Widget.registW("app-ui-mainTop",UiMainTop);
//添加全局监听
AppEmitter.add("intoMain",Player.init);
AppEmitter.add("account_money",Player.addMoney);
DB.emitter.add("stage.level",Player.updateStageLevel);
DB.emitter.add("stage.fightCount",Player.updateStageLevel);