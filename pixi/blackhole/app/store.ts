/****************** 导入 ******************/

import Widget from '../libs/ni/widget';
import Connect from "../libs/ni/connect";
import DB from '../libs/ni/db';

import {AppEmitter} from './appEmitter';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Store {
    static init(){
        read();
    }
}
/****************** 本地 ******************/
let node = {
    fastLevel:null,
    fastMoney: null
}
//快速购买按钮
class FastBuy extends Widget{
    /**
     * 上一次购买的时间点
     */
    // buyTimer = 0
    setProps(props){
        super.setProps(props);
        console.log("FastBuy");
    }
    added(){
        node.fastLevel = this.elements.get("fast_buy_level");
        node.fastMoney = this.elements.get("fast_buy_money");
        if(DB.data.store.fast.length > 0){
            updataFastShow();
        }
    }
    /**
     * @description 响应快速购买
     */
    fastBuy(e){
        console.log(`tap fast_buy button~~`,e);
        // if(this.buyTimer && Date.now() - this.buyTimer < 300){
        //     return;
        // }
        // this.buyTimer = Date.now();
        Connect.request({type:"app/store@fastbuy",arg:{type:DB.data.equip.tab+1,max: DB.data.equip[(DB.data.equip.tab?"arms":"armors")+"Max"]}},(data) => {
            if(data.err){
                return console.log(data.err.reson);
            }
            AppEmitter.emit("account_equip",data.ok.equip);
            AppEmitter.emit("account_money",data.ok.money);
            DB.data.store.fast[DB.data.equip.tab] = data.ok.fast;
            updataFastShow();
        })
    }
}
//读取商店数据
const read = () => {
    Connect.request({type:"app/store@read",arg:{}},(data) => {
        if(data.err){
            return console.log(data.err.reson);
        }
        DB.data.store.fast[0] = data.ok.fast[0];
        DB.data.store.fast[1] = data.ok.fast[1];
        updataFastShow();
    })
}
//更新快速购买按钮
const updataFastShow = () => {
    if(!node.fastLevel){
        return;
    }
    let type = DB.data.equip.tab;
    node.fastLevel.text = "LV."+DB.data.store.fast[type][0];
    node.fastMoney.text = DB.data.store.fast[type][1];
}

/****************** 立即执行 ******************/
//初始化玩家数据库表
DB.init("store",{fast:[]});
//设置数据监听
DB.emitter.add("equip.tab",() => {
    updataFastShow();
})
//注册组件
Widget.registW("app-ui-fastBuy",FastBuy);
//注册全局广播监听
AppEmitter.add("intoMain",Store.init);