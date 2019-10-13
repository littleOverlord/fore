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
	static from = ""
	/**
	 * @description 文件处理具体模块，根据不同平台匹配
	 */
	static fs
	/**
	 * @description 创建fs的函数，由每个平台自己的fs模块设置
	 */
	static createFs: Function
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
		Fs.remote = cfg.appPath || cfg.remote+"/"+cfg.name;
		Fs.from = cfg.platForm;
		Fs.createFs(cfg,callback);
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
					let bt = this.BlobType[Util.fileSuffix(p)] || "",ifont = bt.indexOf("font")>0;
					fileMap[p] = data;
					// if(Util.fileSuffix(p) == ".png"){
					// 	console.log(typeof data);
					// }
					if(!isLocal){
						Fs.fs.write(p,data,(_err,rp)=>{
							if(_err){
								return console.log(_err);
							}
							if(ifont && Fs.fs.addFont){
								Fs.fs.addFont(p,data);
								delete fileMap[p];
							}
							loaded();
						});
					}else{
						if(ifont && Fs.fs.addFont){
							Fs.fs.addFont(p,data);
							delete fileMap[p];
						}
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
		// console.log(Fs.depend);
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
