/**
 * @description 文件缓存模块，兼容微信，pc端(electorn),浏览器
 * @item 微信，文件写入目录 wx.env.USER_DATA_PATH
 * @item pc端，文件全部打入端内，实际上没有写入操作，只有读取
 * @item 浏览器，写入indexDB,如果没有则直接放入内存
 */
/****************** 导入 ******************/

/****************** 导出 ******************/
export default class Fs {
	/**
	 * @description 文件处理具体模块，根据不同平台匹配
	 */
	static fs
	/**
	 * @description depend处理对象
	 */
	static depend: Depend
	/**
	 * @description 文件处理列表
	 * @elements {method:"read"||"write",path:"",callback: Function}
	 */
	static waits = []
	/**
	 * @description 缓存depend文件写入定时器
	 */
	static writeCacheDependTimer: number
	/**
	 * @description 初始化,根据cfg匹配不同平台处理文件对象
	 */
	static init(cfg){
		if(cfg.platForm == "wx"){
			Fs.fs = new WXFS(cfg,Fs.runWait);
		}else if(cfg.platForm == "pc"){
			Fs.fs = new PC();
		}else if(cfg.platForm == "browser"){
			Fs.fs = new Browser(cfg,Fs.runWait);
		}
	}
	/**
	 * @description 读文件
	 */
	static read(path: string,callback: Function):void{

	}
	/**
	 * @description 写文件
	 * @param path 
	 * @param callback 
	 */
	static write(path: string,callback: Function):void{

	}
	/**
	 * @description 执行等待列表
	 */
	static runWait(){
		if(Fs.waits.length === 0){
			return;
		}
	}
	/**
	 * @description 解析项目全资源表
	 */
	static parseDepend(data){
		Fs.depend = new Depend(data);
		console.log(Fs.depend);
	}
	/**
	 * @description 写缓存depend文件，方便查找是否已经存储到本地缓存
	 */
	static writeCacheDpend(){
		if(Fs.writeCacheDependTimer){
			clearTimeout(Fs.writeCacheDependTimer)
		}
		Fs.writeCacheDependTimer = setTimeout(()=>{
			Fs.fs.writeDepend();
		},10000);
	}
}
/****************** 本地 ******************/
/**
 * @description 微信文件处理类
 */
declare const wx;
declare const require;
class WXFS{
	private fs: any
	private userDir: string
	private depend: any
	constructor(cfg: any,callback: Function){
		this.fs = wx.getFileSystemManager();
		this.userDir = wx.env.USER_DATA_PATH;
		this.read("_.depend",(err,data)=>{
			this.depend = err?{}:JSON.parse(data);
			callback && callback();
		})
	}
	isReady: boolean = false
	isLocal(path){
		return !!this.depend[path];
	}
	read(path: string,callback: Function){
		this.fs.readFile({
			filePath: `${this.userDir}/${path}`,
			encoding: "utf8",
			success: (data) => {
				callback(null,data);
			},
			fail: (error)=>{
				callback(error,null);
			}
		})
	}
	write(path: string,data: any,callback: Function){
		this.fs.writeFile({
			filePath: `${this.userDir}/${path}`,
			data: data,
			encoding: "utf8",
			success: () => {
				callback(null,`${this.userDir}/${path}`);
				this.depend[path] = 1;
				Fs.writeCacheDpend();
			},
			fail: (error)=>{
				callback(error,null);
			}
		})
	}
}
/**
 * @description pc端文件处理类
 */
class PC{
	private fs
	constructor(){
		this.fs = require("fs");
	}
	isReady: boolean = true
	isLocal(path: string): boolean{
		return true;
	}
	read(path, callback){

	}
	write(path,data, callback){}
	delete(path, callback){}
}
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
					_this.depend = err?{}:JSON.parse(data);
					callback && callback();
				})
			}, 0);
		},(err)=>{
			alert(err);
		});
	}
	isReady: boolean = false
	isLocal(path: string): boolean{
		return !!this.depend[path];
	}
	/**
	 * @description 读取数据
	 * @example
	 */
	read(path: string, callback: Function) {
		if (!this.iDB) {
			return setTimeout(function () { callback(this.db[path], path); }, 0);
		}
		var request = this.db.transaction(this.tabName, "readonly").objectStore(this.tabName).get(path);
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
	write(path: string, data: any, callback) {
		if (!this.iDB) {
			this.db[path] = data;
			return callback && setTimeout(callback, 0);
		}
		var tx = this.db.transaction(this.tabName, "readwrite");
		tx.objectStore(this.tabName).put(data, path);
		tx.oncomplete = ()=>{
			this.depend[path] = 1;
			Fs.writeCacheDpend();
		};
		tx.onerror = (error)=>{
			// callback(error);
		};
		setTimeout(()=>{
			callback(null,path);
		},0)
		
	};

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
}

/**
 * @description 解析depend
 */
class Depend{
	/**
	 * @description 全资源列表，同depend文件，唯一去除了路径的"/"开头
	 */
	all = {}
	/**
	 * @description 文件夹资源列表
	 * @element dir: [file,file,...]
	 */
	dir = {}
	constructor(data){
		let p,d;
		for(let k in data){
			p = k.replace("/","");
			this.all[p] = data[k];
			data[k].path = p;
			if(data[k].depends){
				for(let i = 0,len = data[k].depends.length;i < len; i++){
					data[k].depends[i] = data[k].depends[i].replace("/","");
				}
			}
			d = p.replace(/[^\/]+$/,"");
			if(!this.dir[d]){
				this.dir[d] = [];
			}
			this.dir[d].push(p);
		}
	}
	/**
	 * @description 获取文件
	 * @param arr 路径或者目录组成的数组
	 */
	getFiles(arr: string[]): string[]{
		let r = [];
		for(let i = 0, len = arr.length; i < len; i++){
			if(this.dir[arr[i]]){
				r = r.concat(this.dir[arr[i]]);
			}else{
				r.push(arr[i]);
			}
		}
		return r;
	}
}

class Resouse{
	constructor(path: string,data: any,realPath?:string,error?: string){
		this.path = path;
		this.data = data;
		this.realPath = realPath || path;
		this.error = error;
	}
	path: string
	data: any
	realPath: string
	error: string
}