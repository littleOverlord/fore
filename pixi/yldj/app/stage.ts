/****************** 导入 ******************/
import Scene from '../libs/ni/scene';

import Frame from '../libs/ni/frame';
import DB from "../libs/ni/db";
import Widget from '../libs/ni/widget';
import Music from '../libs/ni/music';
import Emitter from '../libs/ni/emitter';
import Time from '../libs/ni/time';

import { AppUtil } from "./util";
import Connect from '../libs/ni/connect';


/****************** 导出 ******************/

/****************** 本地 ******************/
let stageNode, // 关卡渲染节点
    scoreNode, // 积分节点
    magnet, // 磁铁
    stageBox, // 游戏主容器
    startNode; // 开始游戏界面
// 速度处理对象
class BASE_V{
    static grad = [[0,4,2],[10,4,4],[30,5.5,4],[60,5.5,7],[120,6,7]]
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
    static BASE = {
        insertShap:{
            min_min:600,
            min_max:1200,
            max_min:2000,
            max_max: 2400
        }
    }
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
        return Math.max(Formula.BASE.insertShap.min_max-t*15,Formula.BASE.insertShap.min_min);
    }
    /**
     * @description 计算形状插入最小时间间隔
     * @param t 关卡进行时间(s)
     */
    static insertRangMax(t: number){
        return Math.max(Formula.BASE.insertShap.max_max-t*10,Formula.BASE.insertShap.max_min);
    }
    /**
     * @description 计算下一次插入形状的时间
     * @param t 关卡进行时间(s)
     */
    static insertShapTime(t: number): number{
        let rmin = Formula.insertRangMin(t),rmax = Formula.insertRangMax(t);
        return Time.global.now() + rmin + Math.floor(Math.random()*(rmax - rmin));
    }
    /**
     * @description 随机一定范围的自然时间点
     * @param last 最大持续时间
     */
    static randomTime(last: number): number{
        return Time.global.now() + Math.random() * last;
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
    /**
     * @description 插入道具的时间
     */
    static insertPropTime(){
        return Time.global.now() + Math.random() * (40000 - 20000) + 20000;
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
    //道具添加时间
    static propTimer
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
    // 能复活的次数
    static reviveCount = 1
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
        if(src.effect == "hp" && (target.god || Time.global.now() < (target.reviveTime+2000)) && src.value < 0){
            return;
        }
        if(typeof src.value == "number"){
            target[src.effect] += src.value;
        }
        
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
        let velocity = shap.velocity,dtime,now = Time.global.now(),x = shap.x, y = shap.y,
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
        // let now = Time.global.now();
        // Stage.self.moveTime = now;
        Stage.self.hp = 1;
        Stage.self.x = (Stage.width - Stage.self.width)/2;
        Stage.self.reviveTime = Time.global.now();
        Stage.setPause(0);
        // console.log("restart!!")
        // for(let i =0 ,len = Stage.shaps.length; i < len; i++){
        //     Stage.shaps[i].moveTime = now;
        // }
    }
    static clear(){
        Stage.shaps = [];
        Stage.self = null;
        Stage.id = 1;
        Stage.events = [];
        Stage.startTime = 0;
        Stage.reviveCount = 1;
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
            if(!Stage.props.suction && !shap.to || shap.type == "boom"){
                return;
            }
            shap.velocity *= 1.3; 
            shap.scale -= 0.05;
            if(shap.scale <= 0){
                shap.scale = 0.001;
            }
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
            for(let k in Formula.BASE.insertShap){
                Formula.BASE.insertShap[k] = Formula.BASE.insertShap[k]/5;
            }
        },
        remove:()=>{
            Stage.events.push({type:"effect",effect:"suction",handler:"remove", target: Stage.self.id});
            Stage.props.suction = 0;
            for(let k in Formula.BASE.insertShap){
                Formula.BASE.insertShap[k] = Formula.BASE.insertShap[k]*5;
            }
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
    //复活时间点
    reviveTime = 0
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
        // if(Stage.pause){
        //     return;
        // }
        Stage.down = Time.global.now();
        // console.log("down time::",Stage.down);
    }
    end(){
        // if(Stage.pause){
        //     return;
        // }
        Stage.up = Time.global.now();
        // console.log("up time::",Stage.up);
    }
    added(node){
        scoreNode = this.elements.get("score");
        stageBox = this.elements.get("stageBox");
        magnet = new Magnet(this.elements);
    }
}
class Magnet{
    constructor(elements){
        this.list[0] = elements.get("zhuazhua0");
        this.list[1] = elements.get("zhuazhua1");
        this.list[1].scale.x = -1;
        this.list[0].state.setAnimation(0, 'zhua02', true);
        this.list[0].state.timeScale = 1;
        this.list[1].state.setAnimation(0, 'zhua02', true);
        this.list[1].state.timeScale = 1;
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
        return Time.global.now() + this.during + Math.floor(this.during * Math.random()*2);
    }
    change(curr){
        // console.log(curr);
        this.curr = curr;
        this.list[curr].state.setAnimation(0, 'zhua01', true);
        this.list[1-curr].state.setAnimation(0, 'zhua02', true);
    }
    update(){
        if(Stage.pause){
            return;
        }
        let diff = this.nearTime - Time.global.now(),v;
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
 * @description 复活等待组件
 */
class WReviveWait extends Widget{
    node
    restart(){
        
        Time.global.resume();
        let node = this.node;
        setTimeout(()=>{
            Scene.remove(node);
            Stage.reStart();
        },0);
    }
    added(node){
        this.node = node;
    }
}
/**
 * @description 开始游戏界面
 */
/**
{
    "type":"app-ui-button",
    "props":{
        "on":{"tap":{"func":"gohome"}},
        "id":"btn_home",
        "url": "images/ui/home.png",
        "width": 90,
        "height": 94,
        "left": -210,
        "top": 922
    }
},
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
        Show.clear();
        setTimeout(()=>{
            Emitter.global.emit("ptRankClose");
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
     * @description 清空显示
     */
    static clear(){
        for(let key in Show.table){
            Scene.remove(Show.table[key]);
            delete Show.table[key];
        }
    }
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
                        // console.log("remove boom~!");
                        setTimeout(()=>{
                            Scene.remove(shap);
                            delete Show.table[ev.shap.id];
                        },0);
                    }
                }
            })
        }
        Show.table[ev.shap.id] = shap;
        if(!Emitter.global.emit("guide",()=>{
            Stage.setPause(0);
        })[0]){
            Stage.setPause(1);
        }
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
            Emitter.global.emit("vibrate");
            Music.play("audio/score.mp3");
        }else if(ev.effect == "hp"){
            shap.die = true;
        }else if(ev.effect == "scale"){
            shap.scale.x = ev.value;
            shap.scale.y = ev.value;
        }else if(ev.effect == "prop"){
            Emitter.global.emit("addProp",ev.value);
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
        if(shapArray.indexOf(shap.widget.props.type) >= 0 && shap.die){
            ScoreEffect.addEff(shap);
        }
        Scene.remove(shap);
        delete Show.table[ev.target];
    }
    static over(){
        let self = Show.table[Stage.self.id];
        self.alpha = 0;
        Music.play("audio/fail.mp3");
        Time.global.stop();
        Emitter.global.emit("clearPropEffect");
        setTimeout(()=>{
            if(Stage.reviveCount > 0){
                Stage.reviveCount --;
                Emitter.global.emit("showRevive",(r)=>{
                    if(r == 0){
                        gameOver();
                    }else if(r == 1){
                        self.alpha = 1;
                        self.x = (Stage.width - Stage.self.width)/2;
                        Scene.open("app-ui-revive_wait",Scene.root);
                    }
                });
            }else{
                gameOver();
            }
            
        },1000)
        
    }
}
class ScoreEffect{
    /**
     * @description 分数缩放
     */
    static scale = 1.5
    /**
     * @description 缩放到最大持续时间
     */
    static stayTime = 0
    /**
     * @description 特效列表
     */
    static effects = []
    /**
     * @description 加分数
     */
    static addScore(){
        scoreNode.text = Stage.self.score.toString();
        ScoreEffect.scale = 1.5;
        if(ScoreEffect.stayTime){
            ScoreEffect.stayTime = Time.global.now()+100;
        }
    }
    /**
     * @description 加特效
     */
    static addEff(shap){
        let cfg = {
            "type": "spine",
            "data": {
                "url":"images/spine/score.atlas",
                "width": 128,
                "height": 128,
                "left": shap.x,
                "top":shap.y,
                "z":2
            }
        },eff = Scene.create(cfg,null,Scene.root),
        baseDist = Stage.self.y - scoreNode.y,
        theDist = AppUtil.caclDistance(shap,scoreNode);
        eff.__startTime = Time.global.now();
        eff.__lastTime = (theDist/baseDist)*1350/1.5;
        eff.__startPos = {x:shap.x,y:shap.y};
        eff.state.setAnimation(0, 'score', false);
        eff.state.timeScale = (baseDist/theDist)*1.5;
        eff.state.addListener({
            complete:(a)=>{
                // console.log(Time.global.now()-eff.startTime);
                eff.aniEnd = true;
                ScoreEffect.addScore();
            }
        })
        ScoreEffect.effects.push(eff);
    }
    /**
     * @description 更新动画
     */
    static update(){
        ScoreEffect.caclScale();
        ScoreEffect.caclPos();
    }
    static caclPos(){
        let i = ScoreEffect.effects.length -1,eff,lt;
        while(i >= 0){
            eff = ScoreEffect.effects[i];
            lt = (Time.global.now() - eff.__startTime)/eff.__lastTime;
            if(lt > 1){
                lt = 1;
            }
            if(eff.aniEnd){
                Scene.remove(eff);
                ScoreEffect.effects.splice(i,1);
            }else{
                // console.log(lt);
                eff.x = eff.__startPos.x + (scoreNode.x - eff.__startPos.x)*lt;
                eff.y = eff.__startPos.y + (scoreNode.y - eff.__startPos.y)*lt;
            }
            i--;
        }
    }
    static caclScale(){
        if(ScoreEffect.scale > 1 && scoreNode.scale.x < ScoreEffect.scale){
            scoreNode.scale.x += 0.1;
            scoreNode.scale.y += 0.1;
            if(scoreNode.scale.x >= ScoreEffect.scale){
                ScoreEffect.stayTime = Time.global.now()+100;
            }
        }else if(ScoreEffect.scale == 1 && scoreNode.scale.x > ScoreEffect.scale){
            scoreNode.scale.x -= 0.1;
            scoreNode.scale.y -= 0.1;
        }else if(ScoreEffect.stayTime == 0 && ScoreEffect.scale > 1 && scoreNode.scale.x >= ScoreEffect.scale){
            ScoreEffect.stayTime = Time.global.now()+100;
        }
        if(ScoreEffect.stayTime && Time.global.now() >= ScoreEffect.stayTime){
            ScoreEffect.stayTime = 0;
            ScoreEffect.scale = 1;
        }
        // console.log(scoreNode.scale.x,scoreNode.scale.y);
    }
    static clear(){
        ScoreEffect.scale = 1;
        ScoreEffect.stayTime = 0;
        scoreNode.scale.x = 1;
        scoreNode.scale.y = 1;
        for(let i = 0, len = ScoreEffect.effects.length; i < len; i++){
            Scene.remove(ScoreEffect.effects[i]);
        }
        ScoreEffect.effects = [];
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
 * @description 游戏结束
 */
const gameOver = () => {
    Emitter.global.emit("newScore",Stage.self.score);
    Emitter.global.emit("clearProp");
    openStart();
    Stage.clear();
    magnet.reset();
    ScoreEffect.clear();
    Time.global.reset();
}
/**
 * @description 开始游戏
 */
const startGame = () => {
    if(!Stage.self){
            
        
        insertSelf();
    }
    Stage.setPause(0);
    Stage.startTime = Time.global.now();
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
        x: (Stage.width-118)/2,
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
    if(Stage.insertTimer && Time.global.now() < Stage.insertTimer){
        return;
    }
    let dt = (Time.global.now() - Stage.startTime)/1000;
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
 * @description 随机一个道具
 */
const propArray = ["armor","filter","suction"];
const insertProp = () => {
    let lastTimer = Stage.propTimer;
    if(Stage.propTimer && Time.global.now() < Stage.propTimer){
        return;
    }
    Stage.propTimer = Formula.insertPropTime();
    if(!lastTimer){
        return;
    }
    let index = Math.floor(Math.random()*propArray.length),
        size = 50 + Math.floor(Math.random()*100),
        x = Math.floor(Math.random()*(Stage.width - size)),
        vy = Formula.dorpV(0.3),
        s = new Shap({
            type: propArray[index],
            camp: 0,
            width: size,
            height: size,
            x: x,
            y: -size,
            effect: "prop",
            value: propArray[index],
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
    if(random < probability || Time.global.now() - Stage.boomTime < 5000 ){
        return;
    }
    Stage.boomTime = Time.global.now();
    size = 140 + Math.floor(Math.random()*80),
    x = Math.floor(Math.random()*(Stage.width - size))
    s = new Shap({
            type: "boom",
            camp: 0,
            width: size,
            height: size,
            box_width:size*2/3,
            box_height:size*2/3,
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
   if(dt >= 0){
        Stage.self.velocity = magnet.curr? BASE_V.player:-BASE_V.player;
   }else if(dt < 0){
        Stage.self.velocity = magnet.curr? -BASE_V.player * 2:BASE_V.player*2;
   }
//    if(Time.global.now() < Stage.self.reviveTime +2000){
    //    console.log(Stage.down,Stage.up ,  Stage.self.velocity);
//    }
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
            if(Time.global.now() >= sa.time){
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
        insertProp();
        Show.distribute(Stage.loop());
        magnet.update();
        
    }
    ScoreEffect.update();
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
Widget.registW("app-ui-revive_wait",WReviveWait);
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
Emitter.global.add("hide",()=>{
    // console.log("stage hide");
    Time.global.stop();
});
Emitter.global.add("show",()=>{
    // console.log("stage show");
    Time.global.resume();
});
//通讯事件监听
Connect.notify.add("close",connectClose);