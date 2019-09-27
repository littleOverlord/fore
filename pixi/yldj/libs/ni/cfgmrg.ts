/****************** 导入 ******************/
import Loader from "./loader";
/****************** 导出 ******************/

export default class CfgMgr {
  //配置资源目录
  static cfgDir = "app/cfg/"
  /**
   * @description 初始化配置表
   * @param data 配置数据{"cfg/xx":{"sheetName":{"keys":[],"values":{}}}}
   */
  static registCfg(data){
    let _data;
    for (let k in data) {
      if(k.indexOf(CfgMgr.cfgDir) == 0){
        _data = JSON.parse(data[k]);
        for(let vk in _data){
          caches[`${k}@${vk}`] = parse(_data[vk].keys,_data[vk].values);
        }
        delete data[k];
      }
    }
    // console.log(caches);
  }
  /**
   * @description 获取某张配置表
   * @param {string} path "cfg/xx@sheetName" 
   */
  static getOne(path: string){
	  return caches[path]
  }
}
/****************** 本地 ******************/
/**
 * @deprecated 配置表缓存
 * @example {"cfg/xx@sheetName":{},...}
 */
const caches = {};
/**
 * @description 解析配置表数据，返回缓存结构
 */
const parse = (keys: Array<string>,data: any): any => {
	let r = {},e = {};
	for(let kk in data){
		for(let i = 0,len = keys.length; i < len; i++){
			e[keys[i]] = data[kk][i];
		}
		r[kk] = e;
		e = {};
	}
	return r;
}

/****************** 立即执行 ******************/
//绑定资源监听
Loader.addResListener("registCfg",CfgMgr.registCfg);