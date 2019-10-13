/**
 * @description 微信分享
 * 所有分享走相同的流程，通过事件分发机制传递分享数据
 */
/****************** 导入 ******************/

import Util from "../ni/util";
import NiFs from "../ni/fs";

/****************** 导出 ******************/

/****************** 本地 ******************/
declare const require;
declare const process;

/**
 * @description pc端文件处理类
 */
class PC{
	private fs
	private path
	private resPath = ""
	constructor(debug: boolean){
		let rp = debug?"src":"resources\\app.asar\\src";
		this.fs = require("fs");
		this.path = require("path");
		this.resPath = this.path.join(process.cwd(),rp);
	}
	except: string[] = []
	isReady: boolean = true
	isLocal(path: string): boolean{
		return true;
	}
	read(path, callback){
		// console.log(path);
		this.fs.readFile(this.path.join(this.resPath,path),{encoding:"utf8"},callback);
	}
	write(path,data, callback){
		callback();
	}
	delete(path, callback){}
	createImg(path: string,data?){
		return this.path.join(this.resPath,path);
	}
}

/****************** 立即执行 ******************/
NiFs.createFs = (cfg,callback) => {
    NiFs.fs = new PC(cfg.debug);
	callback && callback();
}