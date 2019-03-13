/****************** 导入 ******************/
import * as PIXI from '../pixijs/pixi';
import * as Dragon from '../pixijs/dragonBones';
import Util from "./util"
import Loader from "./loader";
/****************** 导出 ******************/
export default class DragonBones {
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
	static data = {}
	/**
	 * @description 添加配置
	 */
	static addDragonData(data){
		console.log(Dragon);
		for(let k in data){
			if(k.indexOf("_ske.json") > 0 || k.indexOf("_tex.json") > 0){
				DragonBones.data[k] = JSON.parse(data[k]);
				delete data[k];
			}
		}
	}
	/**
	 * @description 创建龙骨动画
	 */
	static create(cfg){
		let o, _factory = (Dragon as any).PixiFactory.factory,name = cfg.url,ske = name + "_ske.json",tex = name+"_tex.json", png = name+"_tex.png";
		if(!_factory.getDragonBonesData(ske)){
			_factory.parseDragonBonesData(DragonBones.data[ske]);
		}
		if(!_factory.getTextureAtlasData(tex)){
			_factory.parseTextureAtlasData(DragonBones.data[tex], Loader.resources[png].texture);
		}
		o = _factory.buildArmatureDisplay(cfg.armature);
        
		return o;
		// if(!Spine.spineData[name]){
		// 	return ;
		// }
		// return new PIXI.spine.Spine(Spine.spineData[name]);
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
Loader.addResListener("addDragonData",DragonBones.addDragonData);