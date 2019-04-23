/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import Util from '../libs/ni/util';
import CfgMgr from '../libs/ni/cfgmrg';
import TextAnimate from "../libs/ni/textani";
import Connect from "../libs/ni/connect";
import DB from "../libs/ni/db";
import Widget from '../libs/ni/widget';

import {AppEmitter} from './appEmitter';
import { AppUtil } from "./util";


/****************** 导出 ******************/

/****************** 本地 ******************/
let stageNode // 关卡渲染节点

class Stage {
    static width = 0
    static height = 0
    /**
     * @description 自己
     */
    static self: Shap
    //自己的默认移动速度
    static svx: -3
    /**
     * @description 非自己
     */
    static shaps = []
    //事件列表
    static events = []
    //shap id
    static id = 1
    static pause = 1
    // 获取shap id
    static getId(){
        return Stage.id++;
    }
    // 插入shap
    static insert(shap: Shap){
        shap.id = Stage.getId();
        if(shap.camp){
            Stage.self = shap;
        }else{
            Stage.shaps.push(shap);
        }
        Stage.events.push({type:"insert",shap});
    }
    static run(){
        Stage.move(Stage.self);
        for(let i = 0, len = Stage.shaps.length; i < len; i++){
            Stage.move(Stage.shaps[i]);
            if(AppUtil.Rectangle(Stage.self,Stage.shaps[i])){
                Stage.effect(Stage.shaps[i],Stage.self);
            }
        }
    }
    static loop(): Array<any>{
        let evs;
        if(!Stage.pause){
            Stage.run();
        }
        evs = Stage.events;
        Stage.events = [];
        return evs;
    }
    static effect(src: Shap,target: Shap){
        target[src.effect] += src.value;
        Stage.events.push({type:"effect",effect:src.effect,value: src.value, src:src.id, target: target.id});
    }
    static move(shap: Shap){
        let x = shap.x, y = shap.y,
            cacl = (s,key) => {
                let d = s["v"+key],ad = Math.abs(d),to = s.to[key],at = Math.abs(to),m = to/at;
                if(at > ad){
                    s[key] += (ad * m);
                    s.to[key] = (at-ad)*m;
                    return false;
                }else{
                    s[key] += to;
                    s.to[key] = 0;
                    return true;
                }
            };
        if(shap.to){
            if(cacl(shap,"x") && cacl(shap,"y") && !shap.to.moving){
                shap.to = null;
            }
        }else{
            shap.x += shap.vx;
            shap.y += shap.vy;
        }
        if(x != shap.x || y != shap.y){
            Stage.events.push({type:"move",value: {x: shap.x, y: shap.y}, target: shap.id});
        }
    }
    static result(){
        let r = Stage.self.x <= 0 || Stage.self.x >= (Stage.width - Stage.self.width) || Stage.self.hp <= 0;
        if(r){
            Stage.pause = 1;
        }
        return r;
    }
    static clear(){
        Stage.shaps = [];
        Stage.self = null;
        Stage.id = 1;
        Stage.events = [];
    }
}
class Shap{
    constructor(options){
        for(let k in options){
            this[k] = options[k];
        }
    }
    id = 0
    //阵营 1：己方 0：敌方
    camp = 1
    //形状类型
    type = ""
    //碰撞之后的触发效果类型 "score" "boom"
    effect = ""
    //触发效果的值 根据效果类型，值的类型都不一样
    value: any = 0
    score = 0
    width = 0
    height = 0
    hp = 1
    x = 0
    y = 0
    vx = 0
    vy = 0
    to: any
}
/**
 * @description  关卡界面组件
 */
class WStage extends Widget{
    start(){
        Stage.self && (Stage.self.vx = 3);
        Stage.self.to = Stage.self.to || {x:0,y:0};
        Stage.self.to.moving = true;
    }
    drag(index,e,target){
        // console.log("drag",index,target,e);
        let dx = e.data.global.x - e.start.x,
            dy = e.data.global.y - e.start.y;
        dx += Stage.self.to.x;
        dy += Stage.self.to.y;
        Stage.self.to.x = dx;
        Stage.self.to.y = dy;
    }
    end(){
        Stage.self && (Stage.self.vx = Stage.svx);
        Stage.self.to.moving = false;
    }
}
class Show{
    /**
     * @description 分发事件
     * @param evs 事件列表
     */
    static distribute(evs){
        for(let i = 0,len = evs.length; i < len; i++){
            Show[evs[i].type] && Show[evs[i].type](evs[i]);
        }
    }   
}
/**
 * @description 打开关卡界面
 */
const open = () => {
    stageNode = Scene.open("app-ui-stage",Scene.root);
    Stage.width = stageNode._width;
    Stage.height = stageNode._height;
}
/**
 * @description 插入自己
 */
const insertSelf = () => {
    let s = new Shap({
        type: "player",
        camp: 1,
        width: 10,
        height: 10,
        x: Stage.width/2 -5,
        y: Stage.height - 100,
        effect: "hp",
        value: -1,
        vx: Stage.svx
    });
    Stage.insert(s);
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("stage",{level:1,fightCount:0,lastFightTime:0});
//注册组件
Widget.registW("app-ui-stage",WStage);
//注册循环
Frame.add(()=>{
    Show.distribute(Stage.loop());
},50);
//注册页面打开事件
AppEmitter.add("intoMain",(node)=>{
    open();
    insertSelf();
});