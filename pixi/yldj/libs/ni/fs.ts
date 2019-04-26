/**
 * @description 文件缓存模块，兼容微信，pc端(electorn),浏览器
 * @item 微信，文件写入目录 wx.env.USER_DATA_PATH
 * @item pc端，文件全部打入端内，实际上没有写入操作，只有读取
 * @item 浏览器，写入indexDB,如果没有则直接放入内存
 */
/****************** 导入 ******************/
import Http from "./http";
import Util from "./util";
/****************** 导出 ******************/
export default class Fs {
	static remote = ""
	static appName = ""
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
	 * @description 后缀名对应的Blob类型
	 */
	static BlobType = {
		".png"  : 'image/png',
		".jpg"  : 'image/jpeg',
		".jpeg" : 'image/jpeg',
		".webp" : 'image/webp',
		".gif"  : 'image/gif',
		".svg"  : 'image/svg+xml',
		".ttf"  : 'application/x-font-ttf',
		".otf"  : 'application/x-font-opentype',
		".woff" : 'application/x-font-woff',
		".woff2": 'application/x-font-woff2',
		".mp3"  : 'audio/mpeg3'
	};
	/**
	 * @description 初始化,根据cfg匹配不同平台处理文件对象
	 */
	static init(cfg,callback){
		Fs.appName = cfg.name;
		Fs.remote = cfg.remote+"/"+cfg.name;
		if(cfg.platForm == "wx"){
			Fs.fs = new WXFS(cfg,()=>{
				Fs.mkDirs();
				callback();
			});
		}else if(cfg.platForm == "pc"){
			Fs.fs = new PC(cfg.debug);
			callback && callback();
		}else if(cfg.platForm == "browser"){
			Fs.fs = new Browser(cfg,callback);
		}
	}
	/**
	 * @description 读文件,如果本地没有则去远端下载
	 */
	static read(paths: string[],callback: Function, process?: Function): any{
		let arr = Fs.depend.getFiles(paths,Fs.fs.except), fileMap = {},
			loaded = (() => {
				let c = 0, total = arr.length;
				return ()=>{
					c += 1;
					process && process(c/total);
					if(c == total){
						callback(fileMap);
					}
				}
			})(), 
			deal = (p,isLocal) => {
				return (err,data)=>{
					if(err){
						return console.log(err);
					}
					fileMap[p] = data;
					if(Util.fileSuffix(p) == ".png"){
						console.log(typeof data);
					}
					if(!isLocal){
						Fs.fs.write(p,data,(_err,rp)=>{
							if(_err){
								return console.log(_err);
							}
							loaded();
						});
					}else{
						loaded();
					}
				}
			};
		for(let i = 0, len = arr.length; i < len; i++){
			fileMap[arr[i]] = 0;
			if(Fs.fs.isLocal(arr[i],this.depend.all[arr[i]].sign)){
				Fs.fs.read(arr[i],deal(arr[i],true));
			}else{
				if(Fs.fs.get && this.BlobType[Util.fileSuffix(arr[i])]){
					Fs.fs.get(arr[i],Fs.remote,deal(arr[i],true));
				}else{
					Http.get(`${Fs.remote}/${arr[i]}`,"",this.BlobType[Util.fileSuffix(arr[i])]?"BIN":"",deal(arr[i],false));
				}
			}
		}
		return fileMap;
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
			Fs.fs.writeDepend(()=>{});
			Fs.writeCacheDependTimer = null;
		},10000);
	}
	/**
	 * @
	 */
	static mkDirs(){
		if(Fs.fs && Fs.fs.mkDir){
			for(let k in Fs.depend.dir){
				Fs.fs.mkDir(k);
			}
		}
	}
}
/****************** 本地 ******************/
/**
 * @description 微信文件处理类
 */
declare const wx;
declare const require;
declare const process;
class WXFS{
	private fs: any
	private userDir: string
	private depend: any
	private waitDir = {}
	constructor(cfg: any,callback: Function){
		this.fs = wx.getFileSystemManager();
		this.userDir = wx.env.USER_DATA_PATH;
		this.read(`_.depend`,(err,data)=>{
			this.depend = err?{}:JSON.parse(data);
			callback && callback();
		})
	}
	except: string[] = [".js"]
	isReady: boolean = false
	isLocal(path, sign: string){
		return this.depend[path] == sign;
	}
	read(path: string,callback: Function){
		this.fs.readFile({
			filePath: `${this.userDir}/${path}`,
			encoding: Fs.BlobType[Util.fileSuffix(path)]?"binary":"utf8",
			success: (data) => {
				callback(null,data.data);
			},
			fail: (error)=>{
				callback(error,null);
			}
		})
	}
	write(path: string,data: any,callback: Function, notWriteDepend?: boolean){
		let dir = Util.fileDir(path);
		this.mkDir(dir);
		this.fs.writeFile({
			filePath: `${this.userDir}/${path}`,
			data: data,
			encoding: (typeof data == "string")?"utf8":"binary",
			success: () => {
				callback(null,`${this.userDir}/${path}`);
				console.log(path);
				if(!notWriteDepend){
					this.depend[path] = Fs.depend.all[path].sign;
					Fs.writeCacheDpend();
				}
			},
			fail: (error)=>{
				callback(error,null);
			}
		})
	}
	get(path,remote,callback){
		let _this = this,header = {},binary = Fs.BlobType[Util.fileSuffix(path)];
		if(binary){
			header["content-type"] = "application/octet-stream";
		}
		wx.downloadFile({
			url:`${remote}/${path}`,
			filePath:`${this.userDir}/${path}`,
			header: header,
			success: (res) => {
				console.log(res);
				this.depend[path] = Fs.depend.all[path].sign;
				if(binary){
					callback(null,res);
				}else{
					Fs.writeCacheDpend();
					_this.read(path,(err,data)=>{
						callback(err,data);
					});
				}
			},
			fail: (error)=>{
				callback(error,null);
			}
		})
	}
	mkDir(dir: string){
		dir = dir.replace(/\/$/,"");
		if(!dir){
			return;
		}
		try{
			this.fs.statSync(`${this.userDir}/${dir}`);
		}catch(e){
			try{
				this.fs.mkdirSync(`${this.userDir}/${dir}`,true);
			}catch(err){
				console.log(e,err);
			}
		}
	}
	createImg(path: string,data?){
		return `${this.userDir}/${path}`;
	}
	/**
	 * @description 写入缓存depend
	 * @param callback 
	 */
	writeDepend(callback){
		this.write("_.depend",JSON.stringify(this.depend),(err)=>{
			callback(err);
		},true);
	}
}
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
		console.log(path);
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
			alert(err);
		});
	}
	except: string[] = []
	isReady: boolean = false
	isLocal(path: string, sign: string): boolean{
		return this.depend[path] == sign;
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
	write(path: string, data: any, callback: Function, notWriteDepend: boolean) {
		if (!this.iDB) {
			this.db[path] = data;
			return callback && setTimeout(callback, 0);
		}
		var tx = this.db.transaction(this.tabName, "readwrite");
		tx.objectStore(this.tabName).put(data, path);
		tx.oncomplete = ()=>{
			if(!notWriteDepend){
				this.depend[path] = Fs.depend.all[path].sign;
				Fs.writeCacheDpend();
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
		const blob = new Blob([data], { type: Fs.BlobType[suf] });
		return URL.createObjectURL(blob);
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
			this.adddir(d);
			if(d){
				this.dir[d].push(p);
			}
		}
	}
	private adddir(d){
		let ds = d.split("/"),curr = "",next = "";
		for(let i = 0, len = ds.length; i < len; i++){
			if(!ds[i]){
				continue;
			}
			curr += `${ds[i]}/`;
			if(!this.dir[curr]){
				this.dir[curr] = [];
			}
			if(ds[i+1]){
				next = curr + `${ds[i+1]}/`;
				if(this.dir[curr].indexOf(next) >= 0){
					continue;
				}
				this.dir[curr].push(next);
			}
		}
	}
	/**
	 * @description 获取文件
	 * @param arr 路径或者目录组成的数组
	 */
	getFiles(arr: string[],except: string[]): string[]{
		let r = [],
			dir = (_arr) => {
				for(let i = 0, len = _arr.length; i < len; i++){
					if(this.dir[_arr[i]]){
						dir(this.dir[_arr[i]]);
					}else if(except.indexOf(Util.fileSuffix(_arr[i])) < 0){
						r.push(_arr[i]);
					}
				}
			};
		dir(arr)
		return r;
	}
	/**
	 * @description 寻找模块依赖
	 */
	findModDepend(path,_arr){
		let arr = _arr || [],file,find = (src) => {
			for(let i = src.length - 1;i >= 0;i--){
				file = this.all[src[i]];
				if(file.depends && file.depends.length){
					find(file.depends);
				}
				if(arr.indexOf(src[i]) < 0){
					arr.push(src[i]);
				}
			}
		};
		find([path]);
		return arr;
	}
}
