/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import Util from '../libs/ni/util';
import TextAnimate from "../libs/ni/textani";

import {Fighter as FighterCfg} from './ui/fighter';
import {AppEmitter} from './appEmitter';
import {Fighter, FScene} from './fight';

/****************** 导出 ******************/
/**
 * 关卡
 */
export default class Stage {
    static fightScene
    static delayCall = [];
    static init(){
        fightScene = new FScene();
        textMgr = new TextAnimate(textAni,{fontFamily : 'Arial', fontSize: 24, fill : 0xff0000});
        Frame.add(Stage.loop,50);
        Frame.add(() => {
            Stage.showLoop();
            textMgr.loop();
        });
        //测试fighter
        Stage.addOwer();
        Stage.addMonster();
        
    }
    //战斗循环
    static loop(){
        let evs = fightScene.loop();
        for(let i = 0, len = evs.length; i < len; i++){
            eventHandler[evs[i][0]] && eventHandler[evs[i][0]](evs[i]);
        }
    }
    //战斗表现循环
    static showLoop(){
        let dc = Stage.delayCall,t;
        for(let i = dc.length - 1;i >= 0; i--){
            t = Date.now();
            if(dc[i].last <= t){
                dc[i].func();
                dc.splice(i,1);
            }
        }
    }
    static addOwer(){
        let f = new Fighter({
            x: 340,
            y: 430,
            sid: roleId,
            module: "M_S_002",
            attack: 100,
            maxHp: 800,
            hp: 800,
            camp: 1,
            attackSpeed: 2000
        });
        fightScene.insert(f);
    }
    //添加怪物
    static addMonster(){
        let x = roleSelf?roleSelf.x + (monsterX - 340):monsterX,
            f = new Fighter({
                x: x,
                y: 430,
                sid : "60000",
                module: "M_S_043",
                attack: 20,
                maxHp: 200,
                hp: 200,
                camp: 0,
                passive: 1,
                attackSpeed: 2500
            });
        fightScene.insert(f);
    }
    //添加延迟事件
    static addDelay(callback,dtime){
        Stage.delayCall.push({
            func: callback,
            last: Date.now() + (dtime || 0)
        })
    }
    //移动战斗背景
    static moveBg(distance){
        let bg = Scene.cache["fightSceneBg"],
            _x = bg.x-distance,
            d = -982-_x;
        if(d > 0){
            _x = -d; 
        }
        bg.x = _x;
    }
    //移动敌人
    static moveEnemy(distance,rd){
        let f;
        for(let k in fighterMap){
            f = fighterMap[k];
            if(f.sid == roleId){
                continue;
            }
            f._show.x = f.x - distance + rd;
        }
    }
    //更新自己的血量
    static modifyHp(hp){
        Scene.cache["token_hp"].text = hp+"";
    }
    //伤害延迟
    static damgeDelay(t: Fighter,damage: number){
        t.hp -= damage;
        if(t.sid == roleId){
            Stage.modifyHp(t.hp);
        }
        textMgr.create({
            x: t._show.x - 20,
            y: t._show.y - 250,
            text: damage+"",
            alpha: 1
        },Scene.cache["fightScene"])
    }
    //被击延迟
    static behitDelay(t){
        if(t._show.ni.animate.ani !== "attack"){
            t._show.ni.animate.ani = "behit";
            t._show.ni.animate.once = true;
        }
    }
    //死亡移除战斗者
    static removeFighter(id){
        let f = fighterMap[id];
        Scene.remove(f._show);
        if(f.sid !== roleId){
            Stage.addDelay(
                Stage.addMonster,
                2000
            )
        }
    }
}
/****************** 本地 ******************/
//战斗场景
let fightScene: FScene;
//fighter显示列表
const fighterMap = {};
//玩家id
const roleId = "role";
//玩家自己
let roleSelf;
//怪物位置
const monsterX = 800;
//战斗飘字管理
let textMgr: TextAnimate;
//飘字动画控制
const textAni = (o): boolean => {
    if(o.alpha <= 0){
        return true;
    }
    o.y -= 2;
    o.alpha -= 0.02;
}
//战斗事件处理器列表
const eventHandler = {
    insert: (e) => {
        let f = Util.copy(e[1]),x;
        f._show = Scene.create(new FighterCfg(f.module,f.x,f.y,"standby",((id)=>{
            return (e) => {
                eventHandler.anicallback(e,id);
            }
        })(f.id)),Scene.cache["fightScene"]);
        f._show.anchor.set(0.5,1);
        if(f.camp == 0){
            f._show.scale.x=-1;
        }
        if(f.sid == roleId){
            roleSelf = f;
            x = f.x;
            Stage.modifyHp(f.hp);
        }else{
            x = monsterX;
        }
        f._show.position.set(x,f.y);
        fighterMap[f.id] = f;
    },
    move: (e) => {
        // console.log("move ==== ",e);
        let f = fighterMap[e[1]];
        if(f.sid !== roleId){
            return;
        }
        Stage.moveEnemy(e[2][0],f._show.x)
        Stage.moveBg(e[2][0]-f.x);
        f.x = e[2][0];
    },
    damage: (e) => {
        // console.log(e);
        let f = fighterMap[e[1]],
            t = fighterMap[e[2]];
        f._show.ni.animate.ani = "attack";
        
        f._show.ni.animate.once = true;
        Stage.addDelay(
            ((_t,damage) => {
                return () => {
                    Stage.damgeDelay(_t,damage);
                }
            })(t,e[3]),
            1000
        )
        Stage.addDelay(
            ((_t) => {
                return () => {
                    Stage.behitDelay(_t);
                }
            })(t),
            600
        )
    },
    anicallback: (e,id) => {
        let f = fighterMap[id];
        if(f.remove){
            Stage.addDelay(
                ((_id) => {
                    return () => {
                        Stage.removeFighter(_id);
                    }
                })(id),
                1000
            )
        }
        f._show.ni.animate.ani = "standby";
        f._show.ni.animate.once = false;
    },
    remove: (e) => {
        let f = fighterMap[e[1]];
        f.remove = 1;
    }
}

/****************** 立即执行 ******************/