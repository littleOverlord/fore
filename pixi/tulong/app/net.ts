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
//权重
class Weight{
    /**
     * @description 初始化权重
     * @param wTable 权重表 [10,2,3,...]
     */
    constructor(wTable){
        let w = [];
        for(let i = 0, len = wTable.length;i < len; i ++){
            w.push(this.all);
            this.all += wTable[i];
            w.push(this.all);
            this.table[i] = w;
        }
    }
    private all = 0
    private table = []
    /**
     * @description 计算权重是否通过
     * @returns index 第几个权重，0开始, 对应 table
     */
    public cacl():number{
        let p = Math.random(),l,r;
        for(let i = 0, len = this.table.length; i < len; i++){
            l = this.table[i][0]/this.all;
            r = this.table[i][1]/this.all;
            if(p >= l && p < r){
                return i;
            }
        }
        return -1;
    }
}
/****************** player ******************/
const dataPlayer = {money:0};
//读取玩家信息
const readPlayer = (param: any, callback) => {
    let d = localStorage.player;
    if(d){
        d = JSON.parse(d);
    }else{
        d = dataPlayer;
    }
    callback({ok:d});
}
//添加金币
const addMoney = (m: number): number => {
    dataPlayer.money += m;
    saveDb("player",dataPlayer);
    return dataPlayer.money;
}

Connect.setTest("app/player@read",readPlayer);

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
//装备 [[1(装备类型0武器 1防具),1(等级),1(位置)]]
const accountTest = (param: any,callback: Function) => {
    let award:any = fightAward(param.type);
    if(param.type == 1 && param.result){
        dataStage.fightCount = 0;
        dataStage.level += 1;
    }else{
        dataStage.fightCount += 1;
    }
    saveDb("stage",dataStage);
    callback({ok:{award:award}});
}
const equipWeight = new Weight([4,2,1]); 
//获取关卡奖励
const fightAward = (type):any => {
    let cfg = CfgMgr.getOne("app/cfg/pve.json@stage")[dataStage.level],
        p = [[0.95,1.05],[0.98,1.02]],
        mp = p[type],
        dm = cfg["money"+(type+1)],
        ed = cfg["drop"+(type+1)] || 1,
        dl = cfg["dropLevel"+(type+1)],
        w,
        r:any = {};
    r.money = addMoney(Math.round(dm * (mp[0] + (mp[1]-mp[0]) * Math.random())));
    r.equip = [];
    if(type == 1){
        for(let i = 0; i < 4; i++){
            r.equip.push([Math.round(Math.random()),dl])
        }
    }else if(Math.random() < ed){
        w = equipWeight.cacl();
        switch (w) {
            case 0:
                r.equip.push([Math.round(Math.random()),(dl - 1)<1?dl:(dl - 1)]);
                break;
            case 1:
                r.equip.push([Math.round(Math.random()),dl]);
                break;
            case 2:
                r.equip.push([Math.round(Math.random()),dl+1]);
                break;
        }
    }
    if(r.equip.length){
        r.equip = addEquip(r.equip);
    }
    if(r.equip.length == 0){
        delete r.equip;
    }
    return r;
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
// [level,level,...]
/**
 * @description 添加装备
 * @param data [[type,level],[type,level],...]
 * @returns [[1(装备类型0武器 1防具),1(等级),1(位置)]]
 */
const addEquip = (data: Array<any>) => {
    let item = data.shift(),e,ei = {"0":0,"1":0},r = [];
    while(item){
        e = dataEquip[item[0]];
        for(let len = e.length;ei[item[0]] < len;ei[item[0]]++){
            if(e[ei[item[0]]] == 0){
                e[ei[item[0]]] = item[1];
                r.push([item[0],item[1],ei[item[0]]]);
                break;
            }
        }
        item = data.shift();
    }
    saveDb("equip",dataEquip);
    return r;
}

Connect.setTest("app/equip@read",readEquip);
Connect.setTest("app/equip@mixture",mixtureEquip);