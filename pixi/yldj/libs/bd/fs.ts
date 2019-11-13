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
 * @description 微信文件处理类
 */
declare const swan;

class swanFS{
	private fs: any
	private userDir: string = ""
	private depend: any
	private waitDir = {}
	private localRes = false
	constructor(cfg: any,callback: Function){
		this.fs = swan.getFileSystemManager();
		this.localRes = cfg.localRes;
		if(!cfg.localRes){
			this.userDir = swan.env.USER_DATA_PATH+"/";
			this.read(`_.depend`,(err,data)=>{
				this.depend = err?{}:JSON.parse(data);
				callback && callback();
			})
		}else{
			callback && callback();
		}
	}
	except: string[] = [".js"]
	isReady: boolean = false
	isLocal(path, sign: string){
		return this.localRes || this.depend[path] == sign;
	}
	read(path: string,callback: Function){
		this.fs.readFile({
			filePath: `${this.userDir}${path}`,
			encoding: NiFs.BlobType[Util.fileSuffix(path)]?"":"utf8",
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
			filePath: `${this.userDir}${path}`,
			data: data,
			encoding: (typeof data == "string")?"utf8":"binary",
			success: () => {
				callback(null,`${this.userDir}${path}`);
				// console.log(path);
				if(!notWriteDepend){
					this.depend[path] = NiFs.depend.all[path].sign;
					NiFs.writeCacheDpend();
				}
			},
			fail: (error)=>{
				callback(error,null);
			}
		})
	}
	get(path,remote,callback){
		let _this = this,header = {},binary = NiFs.BlobType[Util.fileSuffix(path)];
		if(binary){
			header["content-type"] = "application/octet-stream";
		}
		swan.downloadFile({
			url:`${remote}/${path}`,
			filePath:`${this.userDir}${path}`,
			header: header,
			success: (res) => {
				// console.log(res);
				this.depend[path] = NiFs.depend.all[path].sign;
				if(binary){
					callback(null,res);
				}else{
					NiFs.writeCacheDpend();
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
			this.fs.statSync(`${this.userDir}${dir}`);
		}catch(e){
			try{
				this.fs.mkdirSync(`${this.userDir}${dir}`,true);
			}catch(err){
				console.log(e,err);
			}
		}
	}
	createImg(path: string,data?){
		return `${this.userDir}${path}`;
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
	/**
     * @description 添加字体
     * @param path 
     */
    addFont(path){
		console.log(`${this.userDir}${path}`);
        let r = swan.loadFont(`${this.userDir}${path}`);
        console.log(r);
    }
}
/****************** 立即执行 ******************/
NiFs.createFs = (cfg,callback) => {
    NiFs.fs = new swanFS(cfg,()=>{
        if(!cfg.localRes){
            NiFs.fs.mkDirs();
        }
        callback();
    });
}