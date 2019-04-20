/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import Util from '../libs/ni/util';
import CfgMgr from '../libs/ni/cfgmrg';
import TextAnimate from "../libs/ni/textani";
import Connect from "../libs/ni/connect";
import DB from "../libs/ni/db";

import {Fighter as FighterCfg, DragonbonesFighter} from './widget/fighter';
import {AppEmitter} from './appEmitter';
import {Fighter, FScene} from './fight';

/****************** 导出 ******************/
/**
 * 关卡
 */
export default class Stage {
    // 战斗逻辑场景
    static fightScene
    // 场景节点
    static sceneNode
    // 延迟函数列表
    static delayCall = []
    // 装备最高等级是否发生变化
    static equipMaxStatus = false
    // 初始调用计数，调用第二次执行
    static initCount = 0
    //前一次战斗是否失败
    static fightFail = false
    // 初始函数
    static init(){
        if(Stage.initCount !== 2){
            return;
        }
        fightScene = new FScene();
        textMgrRed = new TextAnimate(textAni,{fontFamily : 'Arial', fontSize: 24, fill : 0xff0000});
        textMgrGreen = new TextAnimate(textAni,{fontFamily : 'Arial', fontSize: 24, fill : 0x00ff00});
        Frame.add(Stage.loop,50);
        Frame.add(() => {
            Stage.showLoop();
            textMgrRed.loop();
            textMgrGreen.loop();
        });
        Stage.read(()=>{
            //测试fighter
            Stage.addOwer();
            // Stage.fight();
            testSpine();
        });
        
    }
    //读取关卡数据
    static read(callback){
        Connect.request({type:"app/stage@read",arg:{}},(data)=>{
            if(data.err){
                return console.log(data.err.reason);
            }
            for(let k in data.ok){
                DB.data.stage[k] = data.ok[k];
            }
            callback && callback();
        })
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
    //在战斗场景中创建自己
    static addOwer(x?: number){
        let f = new Fighter({
            x: 340,
            y: 430,
            sid: roleId,
            module: "M_S_002",
            attack: equipAttr(1,DB.data.equip.armsMax),
            maxHp: equipAttr(2,DB.data.equip.armorsMax),
            hp: equipAttr(2,DB.data.equip.armorsMax),
            camp: 1,
            attackSpeed: 2000
        });
        fightScene.insert(f);
    }
    //在战斗场景中添加怪物
    static addMonster(monster){
        let x = roleSelf?roleSelf.x + (monsterX - 340):monsterX,
            a = ["attack","hp","attackSpeed","attackDistance","speed"],
            d:any = {
                x: x,
                y: 430,
                sid: "60000",
                camp: 0,
                passive: 1
            },
            f;
        d.module = monster.module;
        for(let i = 0,len = a.length; i < len; i++){
            d[a[i]] = monster.attr[i];
        }
        d.maxHp = d.hp;
        f = new Fighter(d);
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
        let bg = Stage.sceneNode.widget.elements.get("fightSceneBg"),
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
    static modifyShowAttr(type,value){
        Stage.sceneNode.widget.elements.get("token_"+type).text = value+"";
    }
    //伤害延迟
    static damgeDelay(t: Fighter,damage: number){
        t.hp -= damage;
        if(t.sid == roleId){
            Stage.modifyShowAttr("hp",t.hp);
        }
        textMgrRed.create({
            x: t._show.x - 20,
            y: t._show.y - 250,
            text: damage+"",
            alpha: 1
        },Stage.sceneNode)
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
        let f = fighterMap[id],r = f.sid !== roleId?1:0;
        Scene.remove(f._show);
        delete fighterMap[id];
        Stage.account(r,()=>{
            Stage.addDelay(
                ()=>{
                    if(r == 0){
                        Stage.addOwer(roleSelf.x);
                    }else{
                        Stage.fight();
                    }
                },
                2000
            )
        });
        if(r == 0){
            fightScene.removeAll();
            for(let k in fighterMap){
                Scene.remove(fighterMap[k]._show);
                delete fighterMap[k];
            }
        }else{
            fullHp();
        }
    }
    // 调用战斗接口
    // 如果挑战boss失败，则在装备最高等级变化后重新尝试挑战
    static fight(){
        if(!Stage.fightFail && (DB.data.stage.fightCount == 5 || (Stage.equipMaxStatus && DB.data.stage.fightCount > 5))){
            fightType = 1;
            Stage.equipMaxStatus = false;
            Stage.fightFail = false;
        }else{
            fightType = 0;
            if(DB.data.stage.fightCount > 5){
                Stage.fightFail = false;
            }
        }
        Connect.request({type:"app/stage@fight",arg:{type:fightType}},Stage.addMonster);
    }
    //结算
    static account(r,callback){
        if(!r){
            Stage.fightFail = true;
        }
        Connect.request({type:"app/stage@account",arg:{result:r,type:fightType}},(data) => {
            if(data.err){
                return console.log(data.err.reson);
            }
            if(DB.data.stage.fightCount !== data.ok.fightCount){
                DB.data.stage.fightCount = data.ok.fightCount + (!r?1:0);
            }
            if(DB.data.stage.level !== data.ok.level){
                DB.data.stage.level = data.ok.level;
            }
            for(let k in data.ok.award){
                AppEmitter.emit("account_"+k,data.ok.award[k]);
            }
            callback && callback();
        })
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
//怪物类型
let fightType = 0;
//战斗飘字管理
let textMgrRed: TextAnimate, // 红色
    textMgrGreen: TextAnimate; // 绿色
//飘字动画控制
const textAni = (o): boolean => {
    if(o.alpha <= 0){
        return true;
    }
    o.y -= 2;
    o.alpha -= 0.02;
}
//测试spine
const testSpine = () => {
    let sp = Scene.create(new DragonbonesFighter(`fighter00`,"SwordsMan","Swordsman",256,256,"steady",(status,ani)=>{
        console.log(status,ani);
        if(status == "completed"){
            sp.ni.play("steady",0);
        }
    }),null,Stage.sceneNode,null);
    sp.scale.x = -0.5;
    sp.scale.y = 0.5;
    setTimeout(()=>{
        sp.ni.play("attack1",1);
        setTimeout(() => {
            sp.ni.stop("attack1");
            setTimeout(()=>{
                sp.ni.play("attack1",1);
            },2000);  
        }, 1000);
    },5000);
    
}
//战斗事件处理器列表
const eventHandler = {
    insert: (e) => {
        let f = Util.copy(e[1]),x;
        f._show = Scene.create(new FighterCfg(`fighter${f.id}`,f.module,f.x,f.y,"standby",((id)=>{
            return (e) => {
                eventHandler.anicallback(e,id);
            }
        })(f.id)),null,Stage.sceneNode,null);
        f._show.anchor.set(0.5,1);
        if(f.camp == 0){
            f._show.scale.x=-1;
        }
        if(f.sid == roleId){
            roleSelf = f;
            x = f.x;
            Stage.modifyShowAttr("hp",f.hp);
            Stage.modifyShowAttr("attack",f.attack);
            Stage.fight();
        }else{
            x = monsterX;
        }
        f._show.position.set(x,f.y);
        fighterMap[f.id] = f;
        // console.log("inert figter :: ", f.id);
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
            f.remove = 0;
            Stage.addDelay(
                ((_id) => {
                    // console.log("remove fighter::",_id,Date.now());
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
        // console.log("set remove fighter ",f.id);
    },
    resetAttr: (e) => {
        let f = fighterMap[e[1]],
            param = e[2];
        for(let i = 0, len = param.length; i < len; i++){
            switch(param[i][0]){
                case "hp":
                    f.hp += param[i][2];
                    Stage.modifyShowAttr("hp",f.hp);
                    break;
                case "attack":
                    f.attack += param[i][2];
                    Stage.modifyShowAttr("attack",f.attack);
            }
        }
        
    }
}
/**
 * @description 获取装备属性
 * @param type 1武器 || 2防具
 * @param level 装备等级
 */
const equipAttr = (type,level) => {
    // let level = DB.data.equip[type+"Max"];
    return CfgMgr.getOne("app/cfg/pve.json@equipment")[level]["attribute"+type];
}
const fullHp = () => {
    let d = roleSelf.maxHp - roleSelf.hp;
    if(d > 0){
        fightScene.modify(roleSelf.id,[["hp","+",d]]);
    }
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("stage",{level:1,fightCount:0,lastFightTime:0});
DB.emitter.add("equip.armsMax",(old) => {
    if(!old || !roleSelf){
        return;
    }
    let n = equipAttr(1,DB.data.equip.armsMax),o = equipAttr(1,old);
    if(o !== n){
        Stage.equipMaxStatus = true;
        fightScene.modify(roleSelf.id,[["attack","+",n-o]]);
    }
})
DB.emitter.add("equip.armorsMax",(old) => {
    if(!old || !roleSelf){
        return;
    }
    let n = equipAttr(2,DB.data.equip.armorsMax),o = equipAttr(2,old);
    if(o !== n){
        Stage.equipMaxStatus = true;
        fightScene.modify(roleSelf.id,[["hp","+",n-o]]);
    }
})

//注册页面打开事件
AppEmitter.add("openTop",(node)=>{
    Stage.sceneNode = node;
    Stage.initCount += 1;
    Stage.init();
});
AppEmitter.add("equipOk",()=>{
    Stage.initCount += 1;
    Stage.init();
});