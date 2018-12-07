import * as PIXI from '../pixijs/pixi.min';

let loader = PIXI.loader;

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
	static process = (load,resource) => {
		console.log(`load progress：${load.progress}`);
	}
	/**
	 * @description 添加下载任务
	 * @param arr ["url","images/xxx.png",....]
	 * @param successCallback 下载完成的回调
	 */
	static add(arr,successCallback){
		if(Loader.status === Loader.LOADSTATUS.loading){
			return Loader.wait.push([arr,successCallback]);
		}
		Loader.load(arr, successCallback);
	}
	/**
	 * @description 下载
	 */
	static load(arr,successCallback){
		loader.add(arr)
			.on("progress", Loader.process)
			.load(()=>{
				Loader.status = Loader.LOADSTATUS.free;
				loader.reset();
				try{
					successCallback && successCallback();
				}catch(e){
					console.error(e);
				}
				Loader.next();
			});
	}
	/**
	 * @description 下载下一批资源
	 */
	static next(){
		let next = Loader.wait.shift();
		if(Loader.status === Loader.LOADSTATUS.loading && next){
			Loader.load(next[0],next[1]);
		}
	}
}