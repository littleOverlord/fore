/****************** 导入 ******************/

/****************** 导出 ******************/

export default class CfgMgr {
  /**
   * @description 初始化配置表
   * @param data 配置数据{"cfg/xx":{"sheetName":{"keys":[],"values":{}}}}
   */
  static add(data){
    for (let k in data) {
      for(let vk in data[k]){
      caches[`${k}@${vk}`] = parse(data[k][vk].keys,data[k][vk].values);
      }
    }
    console.log(caches);
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