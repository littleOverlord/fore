/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';
import CfgMgr from '../libs/ni/cfgmrg';
import DB from '../libs/ni/db';
import Connect from '../libs/ni/connect';

import {AppEmitter} from './appEmitter';
import {AppUtil} from './util';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Equip {
    //武器
    static arms = []
    //防具
    static armors = []
    //武器容器节点
    static armsNode
    //防具容器节点
    static armorsNode
    /**
     * @description 初始化装备界面
     */
    static init(){
        //创建底部界面
        Scene.open("app-ui-mainBottom",Scene.root,Equip);
        Equip.read();
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
     * @description 读取装备数据
     */
    static read(){
        Connect.request({type:"app/equip@read",arg:{}},(data) => {
            if(data.err){
                return console.log(data.err.reson);
            }
            initRead("arms",data.ok[0]);
            initRead("armors",data.ok[1]);
        })
    }
    /**
     * @description 创建装备显示节点
     */
    static createEquip(type,index,level){
        Equip[type][index] = Scene.open("app-ui-equip",Equip[`${type}Node`],null,{index:index,level:level,type:type});
    }
    /**
     * @description 删除装备显示节点
     */
    static removeEquip(type,index){
        DB.data.equip[type][index] = 0;
        Scene.remove(Equip[type][index]);
        delete Equip[type][index];
    }
    /**
     * @description 移动装备
     */
    static dragEquip(index,type){
        let list = Equip[type],equip = list[index],near = 200 * 200,ni;
        for(let i = 0, len = list.length; i < len; i++){
            if(i == index || !list[i]){
                continue;
            }
            
            let dx = list[i].x - equip.x,dy = list[i].y - equip.y,
                dd = dx * dx + dy * dy;
            if(AppUtil.Rectangle(list[i],equip) && dd < near){
                near = dd;
                ni = i;
            }
        }
        if(ni >= 0){
            Equip.mixtureEquip(index,ni,type);
            return true;
        }
        return false;
    }
    /**
     * @description 合成装备
     * @param src 
     * @param target 
     * @param type 
     */
    static mixtureEquip(src,target,type){
        Connect.request({type:"app/equip@mixture",arg:{src:src,target:target,type:(type == "arms"?1:2)}},(data) => {
            if(data.err){
                return console.log(data.err.reson);
            }
            if(data.ok[0] == 0){
                Equip.removeEquip(type,src);
                Equip.removeEquip(type,target);
                DB.data.equip[type][target] = data.ok[1];
                Equip.createEquip(type,target,data.ok[1]);
            }
        })
    }
}
/****************** 本地 ******************/
//组件扩展
//主界面下面部分
class UiMainBottom extends Widget{
    added(){
        console.log("UiMainBottom added!!");
        matchBg(this.elements.get("bagBG"));
        createEquipBg(this.elements.get("equipBG"));
    }
}
//装备黑色背景
class WEquipBg extends Widget{
    setProps(props){
        super.setProps(props);
        this.cfg.data.url = props.url;
    }
}
//装备黑色背景
class EquipCon extends Widget{
    setProps(props){
        super.setProps(props);
        console.log("EquipCon");
    }
    added(){
        Equip[this.props.index === 0?"armsNode":"armorsNode"] = this.elements.get(this.cfg.data.id);
    }
}
//背包装备图标
class WEquip extends Widget{
    setProps(props){
        super.setProps(props);
        let cfg = CfgMgr.getOne("app/cfg/pve.json@equipment")[props.level],l,t,tl;
        this.cfg.on.drag.arg[0] = this.cfg.on.end.arg[0] = props.index;
        l = props.index % 4;
        t = Math.floor(props.index/4);
        this.cfg.data.x = l * 120 + (l+1) * 30;
        this.cfg.data.y = t * 120 + (t+1) * 30;
        this.cfg.children[0].data.url = `images/${props.type}/${cfg["icon"+(props.type == "arms"?1:2)]}.png`;
        this.cfg.children[1].data.text = `LV ${props.level}`;
        tl = this.cfg.children[1].data.text.length;
        this.cfg.children[1].data.x = 120 - tl * (this.cfg.children[1].data.style.fontSize / 2);
    }
    drag(index,e,target){
        console.log("drag",index,target,e);
        let dx = e.data.global.x - e.start.x,
            dy = e.data.global.y - e.start.y;
        target.x = this.cfg.data.x + dx;
        target.y = this.cfg.data.y + dy;
    }
    dragEnd(index,e,target){
        console.log("dragend",index,target,e);
        if(Equip.dragEquip(index,this.props.type)){
            return;
        }
        target.x = this.cfg.data.x;
        target.y = this.cfg.data.y;
    }
}
//适配背包背景
const matchBg = (bg) => {
    if(Scene.screen.left){
        bg.width += Scene.screen.left * 2;
        bg.x -= Scene.screen.left;
    }
    if(Scene.screen.top){
        bg.height += Scene.screen.top * 2;
    }
}
//创建装备背景
const createEquipBg = (node) => {
    let o,l,t;
    for(let i = 0;i<16;i++){
        o = Scene.open("app-ui-equipBg",node,null,{url:"images/ui/bag_border.png"});
        l = i % 4;
        t = Math.floor(i/4);
        o.x = l * 120 + (l+1) * 30;
        o.y = t * 120 + (t+1) * 30;
    }
}
//初始化读取数据
const initRead = (type: string,data: Array<number>) => {
    let c = DB.data.equip[type];
    for(let i = 0, len = data.length; i < len; i++){
        c[i] = data[i];
        if(data[i]){
            Equip.createEquip(type,i,data[i]);
        }
    }
}
//结算奖励
//[[1(装备类型0武器 1防具),1(等级),1(位置)]]
const mixAccount = (data) => {
    let type: string;
    for(let i = 0, len = data.length; i < len; i++){
        type = data[i][0] === 0? "arms":"armors";
        DB.data.equip[type][data[i][2]] = data[i][1];
        if(data[i][1]){
            Equip.createEquip(type,data[i][2],data[i][1]);
        }
    }
}
/****************** 立即执行 ******************/
//初始化前台数据库表
DB.init("equip",{arms:[],armors:[]});
//注册组件
Widget.registW("app-ui-mainBottom",UiMainBottom);
Widget.registW("app-ui-equipCon",EquipCon);
Widget.registW("app-ui-equip",WEquip);
Widget.registW("app-ui-equipBg",WEquipBg);
//注册全局广播监听
AppEmitter.add("intoMain",Equip.init);
AppEmitter.add("account_equip",mixAccount);