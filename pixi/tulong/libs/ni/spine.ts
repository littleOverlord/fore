/****************** 导入 ******************/
import * as PIXI from '../pixijs/pixi';
import Util from "./util"
import Loader from "./loader";
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
	static addSpineData(data){
		let jk,rawSkeletonData,rawAtlasData,spineAtlas,spineAtlasLoader,spineJsonParser,spineData;
		for(let k in data){
			Spine.cfgs[k] = data[k];
			if(Util.fileSuffix(k) == ".atlas"){
				jk = k.replace(".atlas",".json");
				rawSkeletonData = JSON.parse(data[jk]);
				rawAtlasData = data[k];
				spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, function(line, callback) {
					callback(Loader.resources[k.replace(".atlas",".png")].texture.baseTexture);
				}); 
				spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas)
				spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);
				spineData = spineJsonParser.readSkeletonData(rawSkeletonData);
				console.log(spineData);
				Spine.spineData[k] = spineData;
				delete data[k];
				delete data[jk];
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
/****************** 立即执行 ******************/
//绑定资源监听
Loader.addResListener("addSpineData",Spine.addSpineData);