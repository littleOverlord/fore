/**
 * @description 前台内存数据库
 */
/****************** 导入 ******************/
import Emitter from "./emitter";
import Frame from "./frame";
/****************** 导出 ******************/
export default class DB {
    static attrPrefix = "-_-"
    //存储数据
    static data: any
    //数据库监听器
    static emitter = new Emitter()
    //初始化数据表
    static init(key,value){
        addGetterSetter(DB.data,key,value);
    }
};

/****************** 本地 ******************/
/**
 * @description 监听事件缓存列表，16毫秒跑一次
 */
const cache = {};
/**
 * @description 初始化数据绑定，完成数据监听
 * @param o 绑定父节点
 * @param k 绑定的属性key
 * @param v 绑定的值，如果为对象，则遍历层层绑定
 */
const addGetterSetter = (o: any,k: string,v: any) => {
    let _o = {},path = o[DB.attrPrefix] || [];
    if(typeof v == "object"){
        if(v.length != undefined){
            _o = [];
        }
        o[k] = new Proxy(_o,{
            "get": (target,key) => {
                return target[key];
            },
            "set": (target,key,value) => {
                let p;
                if(key != DB.attrPrefix && target[key] != value){
                    p = target[DB.attrPrefix].slice();
                    p.push(key);
                    addCache(p,target[key]);
                }
                target[key] = value;
                return true;
            },
            "deleteProperty": function (target, key) {
                let p;
                if(target[key] !== undefined){
                    p = target[DB.attrPrefix].slice();
                    p.push(key);
                    addCache(p,target[key]);
                }
              return delete target[key];
            }
        });
        o[k][DB.attrPrefix] = path.slice();
        o[k][DB.attrPrefix].push(k);
        for(let _k in v){
            addGetterSetter(o[k], _k, v[_k]);
        }
    }else{
        o[k] = v;
    }
}
/**
 * @description 添加需要触发的监听到缓存列表
 * @param path 路径数组，由每层的key组成
 * @param old 老的数据
 */
const addCache = (path: Array<string>,old) => {
    let p,k;
    for(let i = 0, len = path.length; i < len; i++){
        p = path.slice(0,i+1);
        k = p.join(".");
        if(!DB.emitter.list[k]){
            continue;
        }
        cache[k] = old;
    }
}
const loop = () => {
    for(let k in cache){
        DB.emitter.emit(k,cache[k]);
        delete cache[k];
    }
}
/****************** 立即执行 ******************/
//初始化数据库对象
addGetterSetter(DB,"data",{});
DB.data[DB.attrPrefix] = [];
//添加到帧循环中
Frame.add(loop);