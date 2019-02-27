/****************** 导入 ******************/
import * as PIXI from '../pixijs/pixi';
import Util from "./util"
/****************** 导出 ******************/
export default class Spine {
	/**
	 * @description 动画列表
	 */
	static anims = []
	/**
	 * @description 配置缓存
	 */
	static cfgs = {}
	/**
	 * @description 配置解析后的spine数据，直接用来创建spine动画对象
	 */
	static spineData = {}
	/**
	 * @description 添加配置
	 */
	static addCaches(data){
		for(let k in data){
			Spine.cfgs[k] = data[k];
			if(Util.fileSuffix(k) == ".json"){
				((key)=>{
					PIXI.spine.parseAltas(data[key],data[key.replace(".json",".atlas")],(name,loaderFunction)=>{
						console.log("spine get texture ",name);
						loaderFunction(PIXI.loader.resources[key.replace(".json",".png")].texture.baseTexture);
					},(res)=>{
						Spine.spineData[key] = res;
					})
				})(k)
				
			}
		}
	}
	/**
	 * @description 创建pine动画
	 */
	static create(name){
		if(!Spine.spineData[name]){
			return ;
		}
		return new PIXI.spine.Spine(Spine.spineData[name]);
	}
	/**
	 * @description 更新动画
	 */
	static update(){

	}
}
/****************** 本地 ******************/
