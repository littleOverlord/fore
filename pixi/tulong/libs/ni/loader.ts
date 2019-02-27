/****************** 导入 ******************/
import * as PIXI from '../pixijs/pixi';
import Util from "./util";
/****************** 导出 ******************/
export default class Loader {
	/**
	 * @description 下载状态
	 */
	static LOADSTATUS = {
		free : 0, // 空闲
		loading : 1 // 加载中
	}
	static status = Loader.LOADSTATUS.free;
	/**
	 * @description 等待下载的任务，先进先下
	 */
	static wait = [];
	/**
	 * @description 下载进度回调,由外部重载
	 */
	static process = (r) => {
		console.log(`load progress：${r}`);
	}
	/**
	 * @description 添加下载任务
	 * @param arr ["url","images/xxx.png",....]
	 * @param successCallback 下载完成的回调
	 */
	static add(arr,successCallback){
		if(Loader.status === Loader.LOADSTATUS.loading){
			return Loader.wait.push(new Waiter(arr,successCallback));
		}
		(new Waiter(arr,successCallback)).start();
	}
	/**
	 * @description 下载
	 */
	static loadImg(waiter: Waiter,successCallback){
		loader.add(waiter.images)
			.on("progress", ()=>{
					waiter.process();
				})
			.load((ld,res)=>{
				try{
					successCallback && successCallback(ld,res);
				}catch(e){
					console.error(e);
				}
			});
	}
	/**
	 * @description 下载下一批资源
	 */
	static next(){
		let next = Loader.wait.shift();
		if(Loader.status === Loader.LOADSTATUS.free && next){
			next.start();
		}
	}
	/**
	 * @description 加载json文件
	 */
	static loadOther(waiter: Waiter,successCallback: Function,encoding?: string){
		let r = {},count = 0;
		for(let i = 0, len = waiter.text.length; i < len; i++){
			fs.readFile({filePath: waiter.text[i], encoding: encoding || "utf8", success: (res)=>{
				if(res.errMsg.indexOf("ok")<0){
					return console.log(res.errMsg);
				}
				r[waiter.text[i]] = res.data;
				count ++;
				waiter.process();
				if(count == waiter.text.length){
					successCallback(r);
				}
			}});
		}
	}
}
/****************** 本地 ******************/
declare const wx;
const loader = PIXI.loader;
const fs = wx.getFileSystemManager();
enum Image {
	".png"=1,
	".jpg"
}
class Waiter{
	text = [];
	images = [];
	callback = null;
	resource = {};
	total = 0;
	loaded = 0;
	constructor(arr,callback){
		let suffix;
		this.total = arr.length;
		for(let i = 0,len = arr.length; i < len; i++){
			suffix = Util.fileSuffix(arr[i]);
			if(Image[suffix]){
				this.images.push(arr[i]);
			}else{
				this.text.push(arr[i]);
			}
		}
		this.callback = callback;
	}
	start(){
		const _this = this;
		Loader.status = Loader.LOADSTATUS.loading;
		Loader.loadImg(this,()=>{
			_this.images = [];
			_this.complete();
		});
		Loader.loadOther(this,(res)=>{
			_this.text = [];
			this.resource = res;
			_this.complete();
		});
	}
	process(){
		this.loaded += 1;
		Loader.process(this.loaded/this.total);
	}
	complete(){
		if(this.images.length === 0 && this.text.length === 0){
			Loader.status = Loader.LOADSTATUS.free;
			loader.reset();
			this.callback && this.callback(this.resource);
			Loader.next();
		}
	}
}