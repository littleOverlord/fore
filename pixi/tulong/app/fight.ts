/**
 * class
 */
//战斗事件
const EType = {
    insert : "insert",
    move   : "move",
    damage : "damage",
    remove : "remove",
    resetAttr : "resetAttr"
}
//战斗者
export class Fighter{
	constructor(obj){
		for(let k in obj){
			this[k] = obj[k];
		}
	}
    name        = "" // 名字
    sid         = "" // fighter外围id
    camp        = 0 // 阵营 1为己方，0为对方
    speed       = 20 // 移动速度
    passive     = 0 // 是否被动
    // fight attributes
    hp          = 0
    maxHp       = 0
    attack      = 0
    attackSpeed = 2500 // 攻击速度,每次出手的时间间隔(ms)
    attackDistance = 150 // 攻击距离 
	// runtime attributes
	x           = 0 
    y           = 0 
	id          = 0 // 场景内的fighter id, 出场顺序递增
    prevAttack  = 0 // 上次出手时间
    target      = 0 // 攻击目标的id
    // render object
    _show: any
}

//战斗场景
export class FScene{
    //战斗者初始id,递增
    fid = 1
    //战斗者列表
    fighters = new Map()
    // 场景时间轴
    now = 0
    //事件列表
    events = [];
    
    /**
     * @description 玩家进入战斗
     * @param f 战斗者
     */
    insert(f){
        let id = this.fid++;
        f.id = id;
        this.fighters.set(id,f);
        this.addEvents([EType.insert,f]);
    }
    //主循环
    loop(){
        let now = Date.now(),evs;
        this.now = now;
        this.fighters.forEach((f,k)=>{
            if(f.hp <= 0){
                this.addEvents([EType.remove,f.id]);
                this.fighters.delete(f.id);
                return;
            }
            if(f.passive || f.attackSpeed > (now - f.prevAttack)){
                return;
            }
            let t = this.fighters.get(f.target);
            if(!t || t.hp <= 0){
                t = Policy.selectTargets(f,this.fighters);
                if(t){
                    f.target = t.id;
				}
				return;
            }
            if(t && !Policy.move(f,t,this)){
				Policy.calc(f,t,this);
				f.prevAttack = now;
            }
        });
        evs = this.events;
        this.events = [];
        return evs;
    }
    //添加事件
    addEvents(es){
        this.events.push(es);
	}
	//检查胜负
	checkResult(){
        var left = 0, right = 0;
        this.fighters.forEach(f => {
            if (f.camp === 1 && f.hp > 0)
                left++;
            if (f.camp === 0 && f.hp > 0)
                right++;
        });
        if (left > 0 && right > 0)
            return 0;
        return left > 0 ? 1 : 2;
    }
    //更新fighter
    modify(id:number,param:any){
        let f = this.fighters.get(id),r = [];
        if(!f){
            return console.log(`There isn't the fighter who's id is ${id}`);
        }
        for(let i = 0, len = param.length; i < len; i++){
            if(param[i].length == 2){
                f[param[i][0]] = param[i][1];
            }else{
                f[param[i][0]] += param[i][2];
            }
        }
        this.addEvents([EType.resetAttr,f.id,param]);
    }
    //移除所有战斗者
    removeAll(){
        this.fighters.forEach(f => {
            this.fighters.delete(f.id);
        })
    }
}
//战斗决策
class Policy{
    /**
     * @description 移动
     * @param f Fighter
     * @param t Fighter
     */
    static move(f, t, s){
        let dis = Math.abs(t.x - f.x),d = dis/f.attackDistance;
        if(d <= 1){
            return false;
        }
        d = f.speed / dis;
        f.x += (t.x - f.x)*d;
        s.addEvents([EType.move,f.id,[f.x]]);
        return true;
    }
    /**
     * @description 战斗计算
     * @param f 
     * @param t 
     * @param s 
     */
    static calc(f, t, s){
        let r = f.attack;
		t.hp -= r;
		if(t.passive){
			t.passive = 0;
		}
        s.addEvents([EType.damage,f.id,t.id,r]);
    }
    /**
     * @description 选择攻击目标
     * @param f fighter
     * @param fighters 
     */
    static selectTargets(f, fighters){
        const camp = Math.abs(f.camp - 1),r = Policy.select(fighters,[["hp",">",0],["camp",camp]]);
        r.sort((a,b)=>{
            return a.x - b.x;
        })
        return r[0];
    }
    /**
     * @description 选择满足条件的fighter
     * @param fighters 
     * @param conds 条件列表 [["hp",">",0],["camp",1]]
     */
    static select(fighters,conds){
        let r = [];
        fighters.forEach((e)=>{
            if(Policy.condsCheck(e,conds)){
                r.push(e);
            }
        });
        return r;
    }
    /**
     * @description 条件变量
     */
    static condValue(obj, cond){
        var i, n;
        if (typeof cond === typeof "") {
            return obj[cond];
        }
        for (i = 0, n = cond.length; i < n; i++) {
            obj = obj[cond];
            if (obj === undefined)
                return;
        }
        return obj;
    }
    // 条件判断表
    static condMap = {
        '>': function (a, b) {
            return a > b;
        },
        '>=': function (a, b) {
            return a >= b;
        },
        '<': function (a, b) {
            return a < b;
        },
        '=<': function (a, b) {
            return a <= b;
        },
        '!=': function (a, b) {
            return a !== b
        }
    }
    static calculate = {
        "=": (a,b) => {
            return b;
        },
        "+": (a,b) => {
            return a + b;
        },
        "*": (a,b) => {
            return a * b;
        },
        "/": (a,b) => {
            return a / b;
        },
        "-": (a,b) => {
            return a - b;
        },
        "^": (a,b) => {
            return Math.pow(a,b);
        }
    }
    /**
     * @description 判断对象是否满足条件conds
     * @param obj 需要判断的对象
     * @param conds 条件列表 [["hp",">",0],["camp",1],["or",["type",1],...]]
     */
    static condsCheck (obj, conds){
        var i,j, c, 
            and = (_c) => {
                if (_c.length == 2) {
                    return this.condValue(obj, _c[0]) === _c[1];
                } else{
                    return this.condMap[_c[1]](this.condValue(obj, _c[0]), _c[2]);
                }
            },
            or = (_c) => {
                for(j = _c.length - 1; j > 0; j--){
                    if(and(_c[j])){
                        return true;
                    }
                } 
                return false;
            };
        for (i = conds.length - 1; i >= 0; i--) {
            c = conds[i];
            if(c[0]=="or"){
                if(!or(c)){
                    return false;
                }
            }else if(!and(c)){
                return false
            }
        }
        return true;
    }
}