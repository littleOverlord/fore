/****************** 导入 ******************/
import Connect from "../libs/ni/connect";
import CfgMgr from "../libs/ni/cfgmrg";
/**
 * @description 模拟后台测试
 */
//存储
const saveDb = (key,data) => {
    localStorage[key] = JSON.stringify(data);
}
/****************** stage ******************/

const dataStage = {level:1,fightCount:0,lastFightTime:0};
//获取当前关卡怪物属性[attack,hp,attackSpeed,attackDistance,speed]
const findMonster = (type) => {
    let a = ["attack","hp","attackSpeed","attackDistance","speed"],
        cfg = CfgMgr.getOne("app/cfg/pve.json@stage")[dataStage.level],
        scale = cfg[`attr${type+1}`],
        attr = CfgMgr.getOne("app/cfg/pve.json@attribute")[cfg[`level${type+1}`]],
        r = [];
    for(let i = 0, len = a.length; i < len; i++){
        r[i] = scale[i] * attr[a[i]];
    }
    // console.log(cfg,attr);
    return {module:cfg[`id${type+1}`],attr:r};
}

//模拟后台读取接口
const readStage = (param: any,callback: Function) => {
    let d = localStorage.stage;
    if(d){
        d = JSON.parse(d);
    }else{
        d = dataStage;
    }
    callback({ok:d});
}

//模拟后台战斗接口
const fightTest = (param: any,callback: Function) => {
    let r:any = {};
    if(param.type == 1 && dataStage.fightCount < 5){
        r.err = {reson:"Can't fight boss!"};
        return callback(r);
    }
    saveDb("stage",dataStage);
    callback(findMonster(param.type));
}
//模拟后台结算接口
//装备 [[1(装备类型0武器 1防具),1(位置),1(等级)]]
const accountTest = (param: any,callback: Function) => {
    let award:any = fightAward(param.type);
    if(param.type == 1){
        dataStage.fightCount = 0;
        dataStage.level += 1;
    }else{
        dataStage.fightCount += 1;
    }
    saveDb("stage",dataStage);
    addEquip(award.equip);
    callback({ok:{award:award}});
}
//获取关卡奖励
const fightAward = (type):any => {
    const cfg = CfgMgr.getOne("app/cfg/pve.json@stage")[dataStage.level];
}
Connect.setTest("app/stage@read",readStage);
Connect.setTest("app/stage@fight",fightTest);
Connect.setTest("app/stage@account",accountTest);

/****************** equip ******************/
//[[武器等级,..],[防具等级,...]]
const dataEquip = [[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
//模拟读取装备
const readEquip = (param: any,callback: Function) => {
    let d = localStorage.equip;
    if(d){
        d = JSON.parse(d);
    }else{
        d = dataEquip;
    }
    callback({ok:d});
}
//模拟合成装备
//param {src:装备源位置, target:目标装备位置, type: 武器(1)||防具(2)}
const mixtureEquip = (param: any,callback: Function) => {
    let type = param.type-1,eq = dataEquip[type],s = eq[param.src], t = eq[param.target],r = [];
    if(s != t){
        eq[param.src] = t;
        eq[param.target] = s;
        r = [t,s];
    }else{
        eq[param.target] = s+1;
        eq[param.src] = 0;
        r = [0,s+1];
    }
    saveDb("equip",dataEquip);
    callback({ok:r});
}
//添加装备
const addEquip = (data) => {
    for(let i = 0, len = data.length; i < len; i++){
        dataEquip[data[i][0]] = data[i][2];
    }
    saveDb("equip",dataEquip);
}

Connect.setTest("app/equip@read",readEquip);
Connect.setTest("app/equip@mixture",mixtureEquip);