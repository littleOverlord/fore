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
    //合成动画节点
    static bottomNode
    //出售按钮
    static saleNode
    //装备合成延迟
    static createEquipDelay
    /**
     * @description 初始化装备界面
     */
    static init(){
        //创建底部界面
        Scene.open("app-ui-mainBottom",Scene.root,Equip);
        Equip.read();
        
    }
    
    /**
     * @description 打开商店界面
     */
    static openStore(e){
        console.log(`tap button_store button~~`,e);
    }
    static tab(pos){
        console.log("select equip type ",pos);
        DB.data.equip.tab = pos;
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
            AppEmitter.emit("equipOk");
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
            return Equip.mixtureEquip(index,ni,type);
        }
        return false;
    }
    /**
     * @description 出售装备
     * @param index 装备位置
     * @param type 装备类型 "arms" || "armors"
     */
    static sale(index: number,type: string): boolean{
        let list = Equip[type],equip = list[index],
            arg = {index:index,type:type == "arms"?1:2},
            level = DB.data.equip[type][index],
            ml = DB.data.equip[type+"Max"];
        if(AppUtil.caclEmptyInObj(list) > 1 && AppUtil.Rectangle(Scene.getGlobal(Equip.saleNode),Scene.getGlobal(equip))){
            Connect.request({type:"app/equip@sale",arg: arg},(data) => {
                if(data.err){
                    return console.log(data.err.reson);
                }
                Equip.removeEquip(type,index);
                if(level == ml){
                    Equip.caclMaxEquip(type);
                }
                AppEmitter.emit("account_money",data.ok.money);
            });
            return true;
        }
    }
    /**
     * @description 合成装备
     * @param src 
     * @param target 
     * @param type 
     */
    static mixtureEquip(src,target,type): boolean{
        if(DB.data.equip[type][target] !== DB.data.equip[type][src]){
            return false;
        }
        Connect.request({type:"app/equip@mixture",arg:{src:src,target:target,type:(type == "arms"?1:2)}},(data) => {
            if(data.err){
                return console.log(data.err.reson);
            }
            if(data.ok[0] == 0){
                Equip.removeEquip(type,src);
                Equip.removeEquip(type,target);
                DB.data.equip[type][target] = data.ok[1];
                Equip.showLightAni(type,target,data.ok[1]);
                if(data.ok[1] > DB.data.equip[type+"Max"]){
                    DB.data.equip[type+"Max"] = data.ok[1];
                }
                // Equip.createEquipDelay = ((a,b,c)=>{
                //     return () => {
                //         Equip.createEquip(a,b,c);
                //     }
                // })(type,target,data.ok[1]);
                
            }
        })
        return true;
    }
    /**
     * @description 显示合成动画
     */
    static showLightAni(type,index,level){
        let l = index % 4,
        t = Math.floor(index/4),
        o = Scene.open("app-ui-ani",Equip.bottomNode,null,{
            "url":"images/ua/equip_light.json",
            "left":l * 120 + (l+1) * 30 + 65 - 60,
            "top":t * 120 + (t+1) * 30 + 145 - 60,
            "width": 240,
            "height": 240,
            "speed": 0.1,
            "ani":"",
            "times": 1,
            "anicallback": () => {
                Equip.createEquip(type,index,level);
                Scene.remove(o);
            }
        });
    }
    /**
     * @description 找到最大等级装备
     * @param type 
     */
    static caclMaxEquip(type: string){
        let eqs = DB.data.equip[type],ml = 0;
        for(let i = 0, len = eqs.length; i < len; i++){
            if(ml < eqs[i]){
                ml = eqs[i];
            }
        }
        DB.data.equip[type+"Max"] = ml;
    }
    /**
     * @description 合成动画回调
     */
    static lightAniBack(){
    }
}
/****************** 本地 ******************/
//组件扩展
//主界面下面部分
class UiMainBottom extends Widget{
    added(){
        console.log("UiMainBottom added!!");
        // matchBg(this.elements.get("bagBG"));
        createEquipBg(this.elements.get("equipBG"));
        Equip.bottomNode = this.elements.get("bottom");
        Equip.saleNode = this.elements.get("button_sale");
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
        this.cfg.data.left = l * 120 + (l+1) * 30;
        this.cfg.data.top = t * 120 + (t+1) * 30;
        this.cfg.children[0].data.url = `images/${props.type}/${cfg["icon"+(props.type == "arms"?1:2)]}.png`;
        this.cfg.children[1].data.text = `LV ${props.level}`;
        tl = this.cfg.children[1].data.text.length;
        this.cfg.children[1].data.left = 120 - tl * (this.cfg.children[1].data.style.fontSize / 2);
    }
    drag(index,e,target){
        // console.log("drag",index,target,e);
        let dx = e.data.global.x - e.start.x,
            dy = e.data.global.y - e.start.y;
        target.ni.left = this.cfg.data.left + dx;
        target.ni.top = this.cfg.data.top + dy;
    }
    dragEnd(index,e,target){
        // console.log("dragend",index,target,e);
        if(Equip.dragEquip(index,this.props.type) || Equip.sale(index,this.props.type)){
            return;
        }
        target.ni.left = this.cfg.data.left;
        target.ni.top = this.cfg.data.top;
    }
}
//适配背包背景
const matchBg = (bg) => {
    if(Scene.screen.left){
        bg.ni.width += Scene.screen.left * 2;
        bg.ni.left -= Scene.screen.left;
    }
    if(Scene.screen.top){
        bg.ni.height += Scene.screen.top * 2;
    }
}
//创建装备背景
const createEquipBg = (node) => {
    let o,l,t;
    for(let i = 0;i<16;i++){
        o = Scene.open("app-ui-equipBg",node,null,{url:"images/ui/bag_border.png"});
        l = i % 4;
        t = Math.floor(i/4);
        o.ni.left = l * 120 + (l+1) * 30;
        o.ni.top = t * 120 + (t+1) * 30;
    }
}
//初始化读取数据
const initRead = (type: string,data: Array<number>) => {
    let c = DB.data.equip[type];
    for(let i = 0, len = data.length; i < len; i++){
        c[i] = data[i];
        if(data[i]){
            Equip.createEquip(type,i,data[i]);
            if(data[i] > DB.data.equip[type+"Max"]){
                DB.data.equip[type+"Max"] = data[i];
            }
        }
    }
    console.log("init db equip:: ");
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
            if(data[i][1] > DB.data.equip[type+"Max"]){
                DB.data.equip[type+"Max"] = data[i][1];
            }
        }
    }
}
/****************** 立即执行 ******************/
//初始化前台数据库表
DB.init("equip",{arms:[],armors:[],armsMax:0,armorsMax:0,tab: 0});
//注册组件
Widget.registW("app-ui-mainBottom",UiMainBottom);
Widget.registW("app-ui-equipCon",EquipCon);
Widget.registW("app-ui-equip",WEquip);
Widget.registW("app-ui-equipBg",WEquipBg);
//注册全局广播监听
AppEmitter.add("intoMain",Equip.init);
AppEmitter.add("account_equip",mixAccount);