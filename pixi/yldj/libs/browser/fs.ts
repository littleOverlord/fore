/**
 * @description 微信分享
 * 所有分享走相同的流程，通过事件分发机制传递分享数据
 */
/****************** 导入 ******************/

import Util from "../ni/util";
import NiFs from "../ni/fs";

/****************** 导出 ******************/

/****************** 本地 ******************/
/**
 * @description 浏览器文件处理类
 */
class Browser{
	private iDB
	private dbName:string
	private tabName:string
	private depend: any
	private db: any
	private init(callback,errorCallback){
		let _this = this;
		if (!_this.iDB) {
			_this.db = {};
			return callback && setTimeout(callback, 0);
		}
		try {
			var request = _this.iDB.open(_this.dbName, 1);
			request.onupgradeneeded = function (e) {
				// 创建table
				e.currentTarget.result.createObjectStore(_this.tabName, { autoIncrement: false });
			};
			request.onsuccess = function (e) {
				_this.db = e.currentTarget.result;
				callback && callback();
			};
			request.onerror = errorCallback;
		} catch (e) {
			_this.iDB = undefined;
			_this.db = {};
			return callback && setTimeout(callback, 0);
		}
	}
	constructor(cfg: any,callback: Function){
		let _this = this;
		_this.dbName = cfg.name;
		_this.tabName = cfg.name
		_this.iDB = self.indexedDB || (self as any).webkitIndexedDB || (self as any).mozIndexedDB || (self as any).OIndexedDB || (self as any).msIndexedDB;
		_this.init(()=>{
			setTimeout(() => {
				_this.read("_.depend",(err,data)=>{
					_this.depend = (err || !data)?{}:JSON.parse(data);
					callback && callback();
				})
			}, 0);
		},(err)=>{
			console.log(err);
		});
	}
	except: string[] = []
	isReady: boolean = false
	isLocal(path: string, sign: string): boolean{
		if(NiFs.from == "app"){
			return false;
		}else{
			return this.depend[path] == sign;
		}
	}
	/**
	 * @description 读取数据
	 * @example
	 */
	read(path: string, callback: Function) {
		let _this = this;
		if (!_this.iDB) {
			return setTimeout(function () { 
				callback(null,_this.db[path]); 
			}, 0);
		}
		var request = this.db.transaction(_this.tabName, "readonly").objectStore(_this.tabName).get(path);
		request.onsuccess = function (e) {
			callback(null,e.target.result);
		};
		request.onerror = (error)=>{
			callback(error);
		};
	};

	/**
	 * @description 写入数据，如果键名存在则替换
	 * @example
	 */
	write(path: string, data: any, callback: Function, notWriteDepend: boolean) {
		if (!this.iDB) {
			this.db[path] = data;
			return callback && setTimeout(callback, 0);
		}
		var tx = this.db.transaction(this.tabName, "readwrite");
		tx.objectStore(this.tabName).put(data, path);
		tx.oncomplete = ()=>{
			if(!notWriteDepend){
				this.depend[path] = NiFs.depend.all[path].sign;
				NiFs.writeCacheDpend();
			}
		};
		tx.onerror = (error)=>{
			// callback(error);
		};
		setTimeout(()=>{
			callback(null,path);
		},0)
		
	};
	/**
	 * @description 创建可用图片url
	 * @param path 
	 * @param data 
	 */
	createImg(path: string,data: any){
		const suf = Util.fileSuffix(path);
		const blob = new Blob([data], { type: NiFs.BlobType[suf] });
		const url = URL.createObjectURL(blob);
		return url;
	}
	/**
	 * @description 删除数据
	 * @example
	 */
	delete(path: string, callback:Function) {
		if (!this.iDB) {
			delete this.db[path];
			return callback && setTimeout(callback, 0);
		}
		var tx = this.db.transaction(this.tabName, "readwrite");
		tx.objectStore(this.tabName).delete(path);
		tx.oncomplete = ()=>{
			callback();
		};
		tx.onerror = (error)=>{
			callback(error);
		};
	};
	/**
	 * @description 写入缓存depend
	 * @param callback 
	 */
	writeDepend(callback){
		this.write("_.depend",JSON.stringify(this.depend),(err)=>{
			callback(err);
		},true);
	}
	/**
     * @description 添加字体
     * @param path 
     */
    addFont(path,data){
		// let style = document.createElement("style"),name = Util.fileName(path);
		// style.innerText = `@font-face { font-family: '${name}'; src:url('${this.createImg(path,data)}') format('truetype'); } `;
		// document.head.appendChild(style);
		// style.onload = ()=>{
		// 	document.head.removeChild(style);
		// }
    }
}

/****************** 立即执行 ******************/
NiFs.createFs = (cfg,callback) => {
    NiFs.fs = new Browser(cfg,callback);
}