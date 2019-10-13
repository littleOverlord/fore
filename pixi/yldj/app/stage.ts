/****************** 导入 ******************/
import Scene from '../libs/ni/scene';

import Frame from '../libs/ni/frame';
import DB from "../libs/ni/db";
import Widget from '../libs/ni/widget';
import Music from '../libs/ni/music';
import Emitter from '../libs/ni/emitter';

import { AppUtil } from "./util";
import Connect from '../libs/ni/connect';
import Spine from '../libs/ni/spine';


/****************** 导出 ******************/

/****************** 本地 ******************/
let stageNode, // 关卡渲染节点
    scoreNode, // 积分节点
    magnet, // 磁铁
    stageBox, // 游戏主容器
    startNode; // 开始游戏界面
// 速度处理对象
class BASE_V{
    static grad = [[0,4,2],[10,4,4],[30,5.5,4],[60,5.5,7],[120,6,7.5]]
    static _player: number
    static _shap: number
    static player: number
    static shap: number
    static currGrad = 0
    /**
     * @description 积分变化，重新计算初始速度
     * @param score 
     */
    static caclGrad(score: number){
        let next = BASE_V.grad[BASE_V.currGrad+1];
        if(!next){
            return;
        }
        if(score >= next[0]){
            BASE_V.currGrad ++;
            BASE_V.init();
        }
    }
    /**
     * @description 初始速度
     */
    static init(){
        BASE_V._player = BASE_V.player = BASE_V.grad[BASE_V.currGrad][2];
        BASE_V._shap = BASE_V.shap = BASE_V.grad[BASE_V.currGrad][1];
        if(Stage.width > Scene.screen._width){
            BASE_V.player = Math.floor((BASE_V.player/Scene.screen._width)*Stage.width);
        }
        if(Stage.height > Scene.screen._height){
            BASE_V.shap = Math.floor((BASE_V.shap/Scene.screen._height)*Stage.height);
        }
        // console.log(BASE_V._player,BASE_V.player,BASE_V._shap,BASE_V.shap);
    }
    static reset(){
        BASE_V.currGrad = 0;
        BASE_V.init();
    }
}
/**
 * @description 公式
 */
class Formula{
    /**
     * @description 计算形状分数
     * @param v 速度
     * @param area 面积
     */
    static shapScore(v: number,area:number){
        return Math.round((v+2)*76825/(10000+area)/4);
    }
    /**
     * @description 计算形状插入最小时间间隔
     * @param t 关卡进行时间(s)
     */
    static insertRangMin(t:number){
        return Math.max(1200-t*15,600);
    }
    /**
     * @description 计算形状插入最小时间间隔
     * @param t 关卡进行时间(s)
     */
    static insertRangMax(t: number){
        return Math.max(2400-t*10,2000);
    }
    /**
     * @description 计算下一次插入形状的时间
     * @param t 关卡进行时间(s)
     */
    static insertShapTime(t: number): number{
        let rmin = Formula.insertRangMin(t),rmax = Formula.insertRangMax(t);
        return Date.now() + rmin + Math.floor(Math.random()*(rmax - rmin));
    }
    /**
     * @description 随机一定范围的自然时间点
     * @param last 最大持续时间
     */
    static randomTime(last: number): number{
        return Date.now() + Math.random() * last;
    }
    /**
     * @description 形状旋转随机速度和方向
     * @param v 速度
     */
    static shapAniRandomV(v: number): number{
        return v*(0.1+1*Math.random()) * (Math.random()>0.5?-1:1);
    }
    /**
     * @description 计算掉落速度,在一定范围上下浮动
     * @param rang 浮动范围(0.3)
     */
    static dorpV(rang:number):number{
        let rad = Math.random()*rang,mk = Math.random()>0.5?-1:1;
        return BASE_V.shap * (1+rad*mk);
    }
}
/**
 * @description 关卡状态机
 */
class Stage {
    static startTime = 0
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
    // 道具状态
    static props: any = {}
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
        Stage.checkPropEffect("insert",shap);
        Stage.events.push({type:"insert",shap});
    }
    static run(){
        Stage.move(Stage.self);
        for(let i = Stage.shaps.length - 1; i >= 0; i--){
            Stage.move(Stage.shaps[i]);
            Stage.checkPropEffect("move",Stage.shaps[i]);
            if(Stage.shaps[i].hp > 0 && AppUtil.Rectangle(ShapBox.cacl(Stage.self),ShapBox.cacl(Stage.shaps[i]))){
                Stage.effect(Stage.shaps[i],Stage.self);
                // if(Stage.result()){
                //     if(Stage.self.hp <= 0){
                //         Stage.removeOne(i);
                //     }
                //     return;
                // }
                Stage.effect(Stage.self,Stage.shaps[i]);
            }
            if(Stage.shaps[i].hp <= 0 || Stage.shaps[i].y >= Stage.height){
                Stage.removeOne(i);
            }
            if(Stage.result()){
                return;
            }
        }
    }
    static removeOne(i){
        Stage.events.push({type:"remove",target: Stage.shaps[i].id});
        Stage.shaps.splice(i,1);
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
    /**
     * @description 效果
     * @param src 施加效果的对象
     * @param target 被施加效果的对象
     */
    static effect(src: Shap,target: Shap){
        //判断目标是否无敌
        if(src.effect == "hp" && target.god && src.value < 0){
            return;
        }
        target[src.effect] += src.value;
        Stage.events.push({type:"effect",effect:src.effect,value: src.value, src:src.id, target: target.id});
    }
    /**
     * @description 道具效果
     * @param name 道具名字 
     * @param status 效果状态 0 移除 1添加
     */
    static propEffect(name: string,status:number){
        let ischange = !!Stage.props[name] != !!status;
        if(!ischange){
            return;
        }
        Stage.props[name] = status;
        if(status == 1){
            PropHandl[name].add();
        }else{
            PropHandl[name].remove()
        }
    }
    /**
     * @description 根据触发点，触发对应道具效果
     * @param type "insert"
     * @param shap 
     */
    static checkPropEffect(type: string,shap: Shap){
        for(let k in Stage.props){
            if(Stage.props[k] && PropHandl[k][type]){
                PropHandl[k][type](shap);
            }
        }
    }
    /**
     * @description 移动
     * @param shap 
     */
    static move(shap: Shap){
        let velocity = shap.velocity,dtime,now = Date.now(),x = shap.x, y = shap.y,
            cacl = (s) => {
                let dx = s.to.x - s.x,
                    dy = s.to.y - s.y,
                    dist = Math.sqrt(dx * dx + dy * dy),
                    ratio = dist / velocity;
                if(ratio > 1){
                    s.x += velocity * (dx / Math.abs(dx));
                    s.y += velocity * (dy / Math.abs(dy));
                    return false;
                }else{
                    s.x += dx;
                    s.y += dy;
                    return true;
                }
            };
        if(shap.moveTime){
            dtime = now - shap.moveTime;
            velocity *= (dtime/16);
            shap.moveTime = now;
        }
        if(shap.to){
            if(cacl(shap)){
                shap.to = null;
            }
        }else if(shap.type == "player"){
            shap.x += velocity;
        }else{
            shap.y += velocity;
        }
        if(x != shap.x || y != shap.y){
            Stage.events.push({type:"move",value: {x: shap.x, y: shap.y}, target: shap.id});
        }
    }
    /**
     * @description 检查结果
     */
    static result(){
        let r = Stage.self.x <= 0 || Stage.self.x >= (Stage.width - Stage.self.width) || Stage.self.hp <= 0;
        if(r){
            Stage.setPause(1);
            Stage.events.push({type:"over",result:r});
        }
        return r;
    }
    static checkOut(shap){

    }
    static setPause(b:number){
        Stage.pause = b;
        Emitter.global.emit("stagePause",b);
    }
    /**
     * @description 复活重新开始
     */
    static reStart(){
        let now = Date.now();
        Stage.self.moveTime = now;
        Stage.self.hp = 1;
        Stage.self.x = (Stage.width - Stage.self.width)/2;
        Stage.setPause(0);
        for(let i =0 ,len = Stage.shaps.length; i < len; i++){
            Stage.shaps[i].moveTime = now;
        }
    }
    static clear(){
        Stage.shaps = [];
        Stage.self = null;
        Stage.id = 1;
        Stage.events = [];
        Stage.startTime = 0
    }
}

/**
 * @description 道具效果处理
 */
class PropHandl{
    /**
     * @description 吸力
     */
    static suction = {
        // 插入形状时的初始化函数
        insert:(shap: Shap)=>{
            if(!Stage.props.suction || shap.type == "boom"){
                return;
            }
            shap.to = Stage.self;
        }, 
        move:(shap: Shap)=>{
            if(!Stage.props.suction || !shap.to){
                return;
            }
            shap.velocity *= 1.5; 
            shap.scale /= 1.5;
            Stage.events.push({type:"effect",effect:"scale",value:shap.scale, target: shap.id});
        },
        add:()=>{
            for(let i = 0, len = Stage.shaps.length; i < len; i++){
                if(Stage.shaps[i].type == "boom"){
                    continue;
                }
                Stage.shaps[i].to = Stage.self;
            }
            Stage.events.push({type:"effect",effect:"suction",handler:"add", target: Stage.self.id});
            Stage.props.suction = 1;
        },
        remove:()=>{
            Stage.events.push({type:"effect",effect:"suction",handler:"remove", target: Stage.self.id});
            Stage.props.suction = 0;
        }
    }
    /**
     * @description 过滤炸弹
     */
    static filter = {
        line: 300,
        move:(shap: Shap)=>{
            if(shap.type != "boom"){
                return;
            }
            if(shap.y > (PropHandl.filter.line - shap.height) && shap.y < PropHandl.filter.line){
                shap.hp = 0;
                Stage.events.push({type:"effect",effect:"hp",value: -1, src:Stage.self.id, target: shap.id});
            }
        },
        add:()=>{
            Stage.events.push({type:"effect",effect:"filter",handler:"add", line: PropHandl.filter.line});
            Stage.props.filter = 1;
        },
        remove:()=>{
            Stage.events.push({type:"effect",effect:"filter",handler:"remove", line: PropHandl.filter.line});
            Stage.props.filter = 0;
        }
    }
    /**
     * @description 防弹铠甲
     */
    static armor = {
        add:()=>{
            Stage.events.push({type:"effect",effect:"armor",handler:"add"});
            Stage.self.box_width = Stage.self.width;
            Stage.self.box_height = Stage.self.height;
            Stage.self.god = 1;
            Stage.props.armor = 1;
        },
        remove:()=>{
            Stage.events.push({type:"effect",effect:"armor",handler:"remove"});
            Stage.self.box_width = 20;
            Stage.self.box_height = 20;
            Stage.self.god = 0;
            Stage.props.armor = 0;
        }
    }
    
}
/**
 * @description 形状类
 */
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
    //是否无敌 0 不是 1 是
    god = 0
    //缩放
    scale = 1

    width = 0
    height = 0
    box_width = null
    box_height = null
    hp = 1
    x = 0
    y = 0
    velocity = 0
    moveTime = 0
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
        // console.log(curr);
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
        let ol = props.width/2,ot = props.height/2;
        this.cfg.data.width = props.width;
        this.cfg.data.height = props.height;
        this.cfg.data.left = props.x;
        this.cfg.data.top = props.y;
        if(props.type == "player"){
            this.cfg.children[0].data.url = `images/ui/circular.png`;
        }else if(props.type == "boom"){
            this.cfg.children[0].data.url = `images/spine/boom.atlas`;
            this.cfg.children[0].type = "spine";
        }else{
            this.cfg.children[0].data.url = `images/shap/${props.type}.png`;
        }
        this.cfg.children[0].data.left = ol;
        this.cfg.children[0].data.top = ot;
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
        this.cfg.children[1].children[1].data.text = scoreNode.text;
    }
    added(){
        let lastScore = this.elements.get("lastScore");
        lastScore.ni.left = -lastScore.width/2;
    }
    startGame(){
        BASE_V.reset();
        // startGame();
        Emitter.global.emit("selectProp");
        setTimeout(()=>{
            Scene.remove(startNode);
            startNode = null;
        },0);
    }
    share(){
        Emitter.global.emit("share");
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
        if(ev.shap.type == "boom"){
            shap.children[0].state.setAnimation(0, 'idle', true);
            // dont run too fast
            shap.children[0].state.timeScale = 1;
            shap.children[0].state.addListener({
                complete:(a)=>{
                    if(a.animation.name == "attack"){
                        console.log("remove boom~!");
                        setTimeout(()=>{
                            Scene.remove(shap);
                            delete Show.table[ev.shap.id];
                        },0);
                    }
                }
            })
        }
        Show.table[ev.shap.id] = shap;
    }
    static move(ev){
        let shap = Show.table[ev.target];
        shap.x = ev.value.x;
        shap.y = ev.value.y;
        if(ev.target == Stage.self.id){
            Emitter.global.emit("selfPos",[ev.value.x,ev.value.y]);
        }
    }
    static effect(ev){
        let shap = Show.table[ev.target];
        if(ev.effect == "score"){
            BASE_V.caclGrad(Stage.self.score);
            scoreNode.text = Stage.self.score.toString();
            Emitter.global.emit("vibrate");
            Music.play("audio/score.mp3");
        }else if(ev.effect == "hp"){
            shap.die = true;
        }else if(ev.effect == "scale"){
            shap.scale.x = ev.value;
            shap.scale.y = ev.value;
        }

    }
    static remove(ev){
        let shap = Show.table[ev.target];
        if(shap.widget.props.type == "boom" && shap.die){
            Music.play("audio/boom.mp3");
            ShapAni.lookatStop(Stage.self,shap);
            shap.children[0].state.setAnimation(0, 'attack', false);
            shap.children[0].state.timeScale = 1;
            return;
        }
        Scene.remove(shap);
        delete Show.table[ev.target];
    }
    static over(){
        let self = Show.table[Stage.self.id];
        self.alpha = 0;
        Music.play("audio/fail.mp3");
        setTimeout(()=>{
            Emitter.global.emit("showRevive",(r)=>{
                if(r == 0){
                    Emitter.global.emit("newScore",Stage.self.score);
                    Emitter.global.emit("clearProp");
                    openStart();
                    Stage.clear();
                    magnet.reset();
                }else if(r == 1){
                    Stage.reStart();
                    self.alpha = 1;
                }
            });
        },1000)
        
    }
}
/**
 * @description 打开关卡界面
 */
const open = () => {
    stageNode = Scene.open("app-ui-stage",Scene.root);
    Stage.width = stageNode._width;
    Stage.height = stageNode._height;
    BASE_V.init();
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
    Stage.setPause(0);
    Stage.startTime = Date.now();
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
        width: 118,
        height: 118,
        box_width:80,
        box_height:80,
        x: Stage.width-118,
        y: Stage.height - (96+118/2),
        effect: "hp",
        value: -1,
        velocity: -BASE_V.player
    });
    Stage.insert(s);
}
/**
 * @description 随机一个形状
 */
const shapArray = ["octagon","pentagon","rectangle","hexagon","triangle"];
const insertShap = () => {
    if(Stage.insertTimer && Date.now() < Stage.insertTimer){
        return;
    }
    let dt = (Date.now() - Stage.startTime)/1000;
    Stage.insertTimer = Formula.insertShapTime(dt);
    let index = Math.floor(Math.random()*shapArray.length),
        size = 50 + Math.floor(Math.random()*200),
        x = Math.floor(Math.random()*(Stage.width - size)),
        vy = Formula.dorpV(0.3),
        s = new Shap({
            type: shapArray[index],
            camp: 0,
            width: size,
            height: size,
            x: x,
            y: -size,
            effect: "score",
            value: Formula.shapScore(vy,size * size),
            velocity: vy
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
        size,
        x,
        s;
    if(random < probability || Date.now() - Stage.boomTime < 5000 ){
        return;
    }
    Stage.boomTime = Date.now();
    size = 140 + Math.floor(Math.random()*80),
    x = Math.floor(Math.random()*(Stage.width - size))
    s = new Shap({
            type: "boom",
            camp: 0,
            width: size,
            height: size,
            box_width:size -40,
            box_height:size -40,
            x: Math.floor(Math.random()*(Stage.width - size)),
            y: -size,
            effect: "hp",
            value: -1,
            velocity: Formula.dorpV(0.3)
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
        Stage.self.velocity = magnet.curr? BASE_V.player:-BASE_V.player;
   }else if(dt < 0){
        Stage.self.velocity = magnet.curr? -BASE_V.player * 2:BASE_V.player*2;
   }
//    console.log(Stage.self.vx);
}
/**
 * @description 形状动画
 */
class ShapAni{
    constructor(o: any){
        this.show = o;
        this.v = this.vt = Formula.shapAniRandomV(ShapAni.vs);
        this.time = Formula.randomTime(ShapAni.during);
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
    //改变旋转时间间隔
    static during = 3000
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
    static lookatStop(look: Shap,at: any){
        let dx = at.x - look.x,
            dy = look.y - at.y,
            r = 0;
        if((dx == 0 && dy == 0) && (dx == 0 && dy > 0)){
            r = 0;
        }else if(dx > 0 && dy == 0){
            r = Math.PI/2;
        }else if(dx == 0 && dy < 0){
            r = Math.PI;
        }else if(dx < 0 && dy ==0){
            r = Math.PI*1.5;
        }else if(dx > 0 && dy >0){
            r = Math.atan(Math.abs(dx/dy));
        }else if(dx > 0 && dy < 0){
            r = Math.atan(Math.abs(dy/dx))+Math.PI/2;
        }else if(dx < 0 && dy < 0){
            r = Math.atan(Math.abs(dx/dy))+Math.PI;
        }else if(dx < 0 && dy > 0){
            r = Math.atan(Math.abs(dy/dx))+Math.PI*1.5;
        }
        at.children[0].rotation  = r;
        delete at.sa;
    }   
    /**
     * @description 同步速度
     * @param sa 
     */
    static syncSpeed(sa){
        let d,ds;
        if(sa.vt == sa.v){
            if(Date.now() >= sa.time){
                sa.time = Formula.randomTime(ShapAni.during);
                sa.vt = Formula.shapAniRandomV(ShapAni.vs);
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
}
/**
 * @description 计算形状包围盒
 */
class ShapBox{
    constructor(x,y,w,h){
        this.reset(x,y,w,h);
    }
    x: number
    y: number
    width: number
    height: number
    reset(x,y,w,h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    destory(){
        ShapBox.cachs.push(this);
    }
    /**
     * @description 包围盒缓存
     */
    static cachs = []
    /**
     * @description 缩放包围盒
     * @param shap 形状数据对象
     * @param last 最终长宽大小
     */
    static cacl(shap) {
        let cach = ShapBox.cachs.shift(),
            bw = shap.box_width || shap.width,
            bh = shap.box_height || shap.height,
            dw = (shap.width - bw)/2,
            dh = (shap.height - bh)/2;
        if(cach){
            cach.reset(shap.x + dw,shap.y + dh,bw,bh);
        }else{
            cach = new ShapBox(shap.x + dw,shap.y + dh,bw,bh);
        }
        return cach;
    }
}
/**
 * @description 通讯连接断开
 */
const connectClose = () => {
    Stage.setPause(1);
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
    BASE_V.reset();
}
/**
 * @description 帧控制器
 */
const frameControl = ()=>{
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
Frame.add(frameControl);
//注册页面打开事件
Emitter.global.add("intoMain",()=>{
    open();
    insertSelf();
    Music.play("audio/bg.mp3",true);
});
Emitter.global.add("gameStart",()=>{
    startGame();
});
Emitter.global.add("propOperate",(param)=>{
    PropHandl[param.type] && PropHandl[param.type][param.operation](param);
});
Connect.notify.add("close",connectClose);