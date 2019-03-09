/****************** 导入 ******************/
import Loader from "./loader";
import Util from "./util";
/****************** 导出 ******************/

export default class Music {
  //配置资源目录
  static table = {}
  /**
   * @description 初始化配置表
   * @param data 配置数据{"cfg/xx":{"sheetName":{"keys":[],"values":{}}}}
   */
  static registMusic(data){
    for (let k in data) {
      if(Util.fileSuffix(k) == ".mp3"){
        this.table = data[k];
        delete data[k];
      }
    }
  }
}
/****************** 本地 ******************/


/****************** 立即执行 ******************/
//绑定资源监听
Loader.addResListener("registMusic",Music.registMusic);