/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import DB from "../libs/ni/db";
import Widget from '../libs/ni/widget';
import Music from '../libs/ni/music';

import {AppEmitter} from './appEmitter';
import { AppUtil } from "./util";
import Connect from '../libs/ni/connect';


/****************** 导出 ******************/

/****************** 本地 ******************/
let stageNode, // 关卡渲染节点
    scoreNode, // 积分节点
    magnet, // 磁铁
    stageBox, // 游戏主容器
    startNode; // 开始游戏界面
const BASE_V = {
    player:7,
    shap:3
}
class Stage {
    static width = 0
    static height = 0
    /**
     * @description 自己
     */
    static self: Shap
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
    //insert boom time
    static boomTime = 0
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
                    if(Stage.self.hp <= 0){
                        Stage.events.push({type:"remove",target: Stage.shaps[i].id});
                    }
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
    //形状类型 boom
    type = ""
    //碰撞之后的触发效果类型 "score" ""
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
        stageBox = this.elements.get("stageBox");
        magnet = new Magnet(this.elements);
    }
}
class Magnet{
    constructor(elements){
        this.list[0] = elements.get("magnet0");
        this.list[1] = elements.get("magnet1");
        this.list[1].scale.x = -1;
        this.cutDown = Scene.open("app-ui-magnet_tip",Scene.root);
    }
    cutDown = null
    list = []
    curr = 0
    nearTime = 0
    during = 10000
    init(){
        this.nearTime = this.caclTime();
        this.change(0);
    }
    caclTime(){
        return Date.now() + this.during + Math.floor(this.during * Math.random()*2);
    }
    change(curr){
        console.log(curr);
        this.curr = curr;
        this.list[1-curr].alpha = 0.3;
        this.list[curr].alpha = 1;
    }
    update(){
        if(Stage.pause){
            return;
        }
        let diff = this.nearTime - Date.now(),v;
        if(this.cutDown.children[1].text == "0" && this.cutDown.alpha == 1){
            this.reset();
            this.nearTime = this.caclTime();
            this.change(1-this.curr);
            return;
        }
        v = Math.ceil(diff/1000);
        if(v < 0){
            v = 0;
        }
        if(v > 5){
            return;
        }
        this.cutDown.alpha = 1;
        this.cutDown.children[1].text = v+"";
    }
    reset(){
        this.cutDown.alpha = 0;
        this.cutDown.children[1].text = "5";
    }
    clear(){
        Scene.remove(this.cutDown);
        this.cutDown = null;
    }
}
/**
 * @description 形状组件
 */
class WShap extends Widget{
    setProps(props){
        super.setProps(props);
        let sc = props.width/this.cfg.data.width;
            // ss = this.cfg.children[1].data.style.fontSize * sc;
            // ss = ss < 24?24:ss;
            this.cfg.data.width = props.width;
        this.cfg.data.height = props.height;
        this.cfg.data.left = props.x;
        this.cfg.data.top = props.y;
        this.cfg.children[0].data.url = props.type == "player"?`images/ui/circular.png`:`images/shap/${props.type}.png`;
        this.cfg.children[0].data.left = props.width/2;
        this.cfg.children[0].data.top = props.height/2;
        if(props.effect == "score"){
            // this.cfg.children[1].data.text = props.value.toString();
        }
        // this.cfg.children[1].data.style.fontSize = ss;
    }
    added(shap){
        // let text = shap.children[1];
        // text.ni.left = (shap._width - text.width)/2;
        // text.ni.top = (shap._height - text.height)/2;
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
    setProps(props){
        super.setProps(props);
        this.cfg.children[2].data.text = scoreNode.text;
    }
    added(){
        let title = this.elements.get("lastScoreTitle"),lastScore = this.elements.get("lastScore");
        title.ni.left = (Stage.width- title.width)/2;
        lastScore.ni.left = (Stage.width- lastScore.width)/2;
    }
    startGame(){
        startGame();
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
        shap = Scene.open("app-ui-shap",stageBox,null,ev.shap);
        if(!ev.shap.camp){
            ShapAni.init(shap);
        }
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
        }else if(ev.effect == "boom"){
            Music.play("audio/boom.mp3");
        }

    }
    static remove(ev){
        let shap = Show.table[ev.target];
        Scene.remove(shap);
        delete Show.table[ev.target];
    }
    static over(){
        AppEmitter.emit("score",Stage.self.score);
        openStart();
        Stage.clear();
        magnet.reset();
    }
}
/**
 * @description 打开关卡界面
 */
const open = () => {
    let diff;
    stageNode = Scene.open("app-ui-stage",Scene.root);
    Stage.width = stageNode._width;
    Stage.height = stageNode._height;
    if(Stage.width > Scene.screen._width){
        BASE_V.player = Math.floor((BASE_V.player/Scene.screen._width)*Stage.width);
    }
    if(Stage.height > Scene.screen._height){
        BASE_V.shap = Math.floor((BASE_V.shap/Scene.screen._height)*Stage.height);
    }
    console.log(Stage.width,Stage.height);
}
/**
 * @description 打开重新开始界面
 */
const openStart = () => {
    startNode = Scene.open("app-ui-start",Scene.root);
}
/**
 * @description 开始游戏
 */
const startGame = () => {
    if(!Stage.self){
            
        for(let key in Show.table){
            Scene.remove(Show.table[key]);
            delete Show.table[key];
        }
        insertSelf();
    }
    if(startNode){
        Scene.remove(startNode);
        startNode = null;
    }
    Stage.pause = 0;
    scoreNode.text = "0";
    magnet.init();
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
        y: Stage.height - 195,
        effect: "hp",
        value: -1,
        vx: -BASE_V.player
    });
    Stage.insert(s);
}
/**
 * @description 随机一个形状
 */
const shapArray = ["diamond","rectangle","hexagon","triangle"];
const insertShap = () => {
    if(Stage.insertTimer && Date.now() < Stage.insertTimer){
        return;
    }
    Stage.insertTimer = Date.now() + Stage.insertRang[0] + Math.floor(Math.random()*(Stage.insertRang[1] - Stage.insertRang[0]));
    let index = Math.floor(Math.random()*shapArray.length),
        size = 50 + Math.floor(Math.random()*200),
        x = Math.floor(Math.random()*(Stage.width - size)),
        vy = BASE_V.shap + Math.floor(Math.random()*BASE_V.shap),
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
 * @description 插入炸弹
 */
const insertBoom = () => {
    let random = Math.random(),
        probability = 0.5,
        s;
    if(random < 0.5 || Date.now() - Stage.boomTime < 5000 ){
        return;
    }
    Stage.boomTime = Date.now();
    s = new Shap({
            type: "boom",
            camp: 0,
            width: 170,
            height: 170,
            x: Math.floor(Math.random()*(Stage.width - 170)),
            y: -170,
            effect: "hp",
            value: -1,
            vy: BASE_V.shap + Math.floor(Math.random()*BASE_V.shap)
        });
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
        Stage.self.vx = magnet.curr? BASE_V.player:-BASE_V.player;
   }else if(dt < 0){
        Stage.self.vx = magnet.curr? -BASE_V.player * 2:BASE_V.player*2;
   }
//    console.log(Stage.self.vx);
}
/**
 * @description 形状动画
 */
class ShapAni{
    constructor(o: any){
        this.show = o;
        this.v = this.vt = ShapAni.rdV();
        this.time = ShapAni.rdTime();
        o.sa = this;
    }
    //显示对象
    show
    //旋转速度
    v
    //改变到新的速度
    vt
    //下次改变旋转速度的时间
    time

    //每帧速度改变的幅度
    static vs = Math.PI / 200
    /**
     * @description 初始化形状动画数据
     * @param o 
     */
    static init(o){
        new ShapAni(o);
    }
    /**
     * @description 动画循环
     */
    static run(){
        let table = Show.table,o;
        for(let k in table){
            o = table[k];
            if(!o.sa){
                continue;
            }
            ShapAni.syncSpeed(o.sa);
            o.children[0].rotation += o.sa.v;
            if(o.children[0].rotation >= Math.PI * 2){
                o.children[0].rotation -= (Math.PI * 2);
            }
        }
    }
    /**
     * @description 同步速度
     * @param sa 
     */
    static syncSpeed(sa){
        let d,ds;
        if(sa.vt == sa.v){
            if(Date.now() >= sa.time){
                sa.time = ShapAni.rdTime();
                sa.vt = ShapAni.rdV();
            }
            return;
        }
        d = sa.vt - sa.v;
        ds = Math.abs(d);
        if(ds > ShapAni.vs){
            sa.v += (ShapAni.vs * (d/ds));
        }else{
            sa.v = sa.vt;
        }
    }
    //随机时间
    static rdTime(){
        return Date.now() + Math.random() * 3000;
    }
    //随机速度
    static rdV(){
        return ShapAni.vs*(0.1+1*Math.random()) * (Math.random()>0.5?-1:1);
    }
}
/**
 * @description 通讯连接断开
 */
const connectClose = () => {
    Stage.pause = 1;
    Stage.clear();
    if(stageNode){
        Scene.remove(stageNode);
        stageNode = null;
    }
    if(magnet){
        magnet.clear();
        magnet = null;
    }
    if(startNode){
        Scene.remove(startNode);
        startNode = null;
    }
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
    if(!stageNode){
        return;
    }
    if(!Stage.pause){
        insertShap();
        insertBoom();
        Show.distribute(Stage.loop());
        magnet.update();
    }
    resetPV();
    ShapAni.run();
});
//注册页面打开事件
AppEmitter.add("intoMain",(node)=>{
    open();
    insertSelf();
});
AppEmitter.add("gameStart",(node)=>{
    startGame();
});
Connect.notify.add("close",connectClose);