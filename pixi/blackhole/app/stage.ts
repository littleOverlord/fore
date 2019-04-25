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
let stageNode, // 关卡渲染节点
    scoreNode, // 积分节点
    startNode; // 开始游戏界面

class Stage {
    static width = 0
    static height = 0
    /**
     * @description 自己
     */
    static self: Shap
    //自己的默认移动速度
    static svx = -14
    /**
     * @description 非自己
     */
    static shaps = []
    //事件列表
    static events = []
    //添加新形状的频率区间
    static insertRang = [600,2000]
    static insertTimer
    //down
    static down = 0
    //up
    static up = 0
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
        for(let i = Stage.shaps.length - 1; i >= 0; i--){
            Stage.move(Stage.shaps[i]);
            if(AppUtil.Rectangle(Stage.self,Stage.shaps[i])){
                Stage.effect(Stage.shaps[i],Stage.self);
                if(Stage.result()){
                    return;
                }
                Stage.effect(Stage.self,Stage.shaps[i]);
            }
            if(Stage.result()){
                return;
            }
            if(Stage.shaps[i].hp <= 0 || Stage.shaps[i].y >= Stage.height){
                Stage.events.push({type:"remove",target: Stage.shaps[i].id});
                Stage.shaps.splice(i,1);
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
            Stage.events.push({type:"over",result:r});
        }
        return r;
    }
    static checkOut(shap){

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
        Stage.down = Date.now();
    }
    end(){
        Stage.up = Date.now();
    }
    added(node){
        scoreNode = this.elements.get("score");
    }
}
/**
 * @description 形状组件
 */
class WShap extends Widget{
    setProps(props){
        super.setProps(props);
        let sc = props.width/this.cfg.data.width,
            ss = this.cfg.children[1].data.style.fontSize * sc;
            ss = ss < 24?24:ss;
            this.cfg.data.width = props.width;
        this.cfg.data.height = props.height;
        this.cfg.data.left = props.x;
        this.cfg.data.top = props.y;
        this.cfg.children[0].data.url = props.type == "player"?`images/ui/token_money.png`:`images/armors/${props.type}.png`;
        if(props.effect == "score"){
            this.cfg.children[1].data.text = props.value.toString();
        }
        this.cfg.children[1].data.style.fontSize = ss;
    }
    added(shap){
        let text = shap.children[1];
        text.ni.left = (shap._width - text.width)/2;
        text.ni.top = (shap._height - text.height)/2;
    }
}
/**
 * @description 玩家组件
 */
class WPlayer extends Widget{
    setProps(props){
        super.setProps(props);
        this.cfg.data.width = props.width;
        this.cfg.data.height = props.height;
        this.cfg.data.left = props.x;
        this.cfg.data.top = props.y;
    }
}
/**
 * @description 开始游戏界面
 */
class WStart extends Widget{
    startGame(){
        if(!Stage.self){
            
            for(let key in Show.table){
                Scene.remove(Show.table[key]);
                delete Show.table[key];
            }
            insertSelf();
        }
        Scene.remove(startNode);
        startNode = null;
        Stage.pause = 0;
    }
}
/**
 * @description 显示事件处理
 */
class Show{
    static table = {}
    /**
     * @description 分发事件
     * @param evs 事件列表
     */
    static distribute(evs){
        for(let i = 0,len = evs.length; i < len; i++){
            Show[evs[i].type] && Show[evs[i].type](evs[i]);
        }
    }   
    static insert(ev){
        let shap;
        // shap = Scene.open(ev.shap.camp?"app-ui-player":"app-ui-shap",stageNode,null,ev.shap);
        shap = Scene.open("app-ui-shap",stageNode,null,ev.shap);
        Show.table[ev.shap.id] = shap;
    }
    static move(ev){
        let shap = Show.table[ev.target];
        shap.x = ev.value.x;
        shap.y = ev.value.y;
    }
    static effect(ev){
        if(ev.effect == "score"){
            scoreNode.text = Stage.self.score.toString();
        }
    }
    static remove(ev){
        let shap = Show.table[ev.target];
        Scene.remove(shap);
        delete Show.table[ev.target];
    }
    static over(){
        openStart();
        Stage.clear();
    }
}
/**
 * @description 打开关卡界面
 */
const open = () => {
    stageNode = Scene.open("app-ui-stage",Scene.root);
    Stage.width = stageNode._width;
    Stage.height = stageNode._height;
    console.log(Stage.width,Stage.height);
}
const openStart = () => {
    startNode = Scene.open("app-ui-start",Scene.root);
}
/**
 * @description 插入自己
 */
const insertSelf = () => {
    let s = new Shap({
        type: "player",
        camp: 1,
        width: 80,
        height: 80,
        x: Stage.width-80,
        y: Stage.height - 300,
        effect: "hp",
        value: -1,
        vx: Stage.svx
    });
    Stage.insert(s);
}
/**
 * @description 随机一个形状
 */
const shapArray = ["1204001","1204002","1204003","1204004","1204005","1204006","1204007","1204008","1204009","1204010"];
const insertShap = () => {
    if(Stage.insertTimer && Date.now() < Stage.insertTimer){
        return;
    }
    Stage.insertTimer = Date.now() + Stage.insertRang[0] + Math.floor(Math.random()*(Stage.insertRang[1] - Stage.insertRang[0]));
    let index = Math.floor(Math.random()*shapArray.length),
        size = 50 + Math.floor(Math.random()*200),
        x = Math.floor(Math.random()*(Stage.width - size)),
        vy = 6 + Math.floor(Math.random()*6),
        s = new Shap({
            type: shapArray[index],
            camp: 0,
            width: size,
            height: size,
            x: x,
            y: -size,
            effect: "score",
            value: Math.ceil(vy*66825/(size * size)),
            vy: vy
        });
    // console.log(Stage.width,size,x);
    Stage.insert(s);
}
/**
 * @description 重置玩家速度
 */
const resetPV = ()=>{
    if(!Stage.self || Stage.pause){
        return;
    }
   let dt = Stage.up - Stage.down; 
   if(dt > 0){
        Stage.self.vx -= 2;
        if(Stage.self.vx < -10){
            Stage.self.vx = -10;
        }
   }else if(dt < 0){
        Stage.self.vx += 2;
        if(Stage.self.vx > 14){
            Stage.self.vx = 14;
        }
   }
   console.log(Stage.self.vx);
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("stage",{level:1,fightCount:0,lastFightTime:0});
//注册组件
Widget.registW("app-ui-stage",WStage);
Widget.registW("app-ui-shap",WShap);
Widget.registW("app-ui-player",WPlayer);
Widget.registW("app-ui-start",WStart);
//注册循环
// Frame.add(()=>{
    
// },50);
Frame.add(()=>{
    if(!Stage.pause){
        insertShap();
    }
    Show.distribute(Stage.loop());
    resetPV();
});
//注册页面打开事件
AppEmitter.add("intoMain",(node)=>{
    open();
    insertSelf();
    openStart();
});