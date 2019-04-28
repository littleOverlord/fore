/****************** 导入 ******************/
import * as Dragon from '../pixijs/dragonBones';
import Loader from "./loader";
/****************** 导出 ******************/
export default class DragonBones {
	/**
	 * @description 动画列表
	 */
	static anims = new Map()
	/**
	 * @description 配置缓存
	 */
	static cfgs = {}
	/**
	 * @description 配置解析后的spine数据，直接用来创建spine动画对象
	 */
	static data = {}
	/**
	 * @description 龙骨动画管理对象
	 */
	static factory
	/**
	 * @description 添加配置
	 */
	static addDragonData(data){
		console.log(Dragon);
		let name,tex;
		if(!DragonBones.factory){
			DragonBones.factory = (Dragon as any).PixiFactory.factory;
		}
		for(let k in data){
			if(k.indexOf("_ske.json") > 0){
				name = k.match(/\/([^\/]+)_ske\.json$/)[1];
				if(!DragonBones.factory.getDragonBonesData(name)){
					DragonBones.factory.parseDragonBonesData(JSON.parse(data[k]));
				}
				if(!DragonBones.factory.getTextureAtlasData(name)){
					tex = k.replace("_ske.json","_tex.json");
					DragonBones.factory.parseTextureAtlasData(JSON.parse(data[tex]), Loader.resources[k.replace("_ske.json","_tex.png")].texture);
				}
				delete data[k];
				delete data[tex];
			}
		}
	}
	/**
	 * @description 创建龙骨动画
	 */
	static create(cfg){
		let o;
		o = DragonBones.factory.buildArmatureDisplay(cfg.armature);
        
		return o;
	}
	/**
	 * @description 更新动画
	 */
	static update(){
		DragonBones.anims.forEach((v,k) => {
			if(v.isCompleted){
				DragonBones.anims.delete(k);
				k.anicallback("completed",v.name);
			}
		})
	}
	/**
	 * @description 添加动画状态
	 * @param type "play"|"stop"
	 * @param status 龙骨动画状态
	 * @param o 龙骨动画显示对象
	 */
	
	/**static addStatus(type,status,o){

	}
	 * @description 更新龙骨动画状态
	 * @param { Ni }o 
	 */
	static play(o){
		let last = DragonBones.anims.get(o),
			status;
		if(o.animate.times <= 0){
			o.show.animation.play(o.animate.ani,o.animate.times);
			if(last && last.name !== o.animate.ani){
				DragonBones.anims.delete(o);
				o.anicallback("stop",last.name);
			}
			return ;
		}else if(last && last.name == o.animate.ani && last.time){
			status = o.show.animation.gotoAndPlayByTime(o.animate.ani,last.time,o.animate.times);
		}else{
			status = o.show.animation.play(o.animate.ani,o.animate.times);
		}
		DragonBones.anims.set(o,status);
	}
	/**
	 * @description 暂停龙骨动画
	 * @param ani 动作名
	 * @param { Ni }o 高层动画封装
	 */
	static stop(ani: string,o: any){
		let last = DragonBones.anims.get(o);
		o.show.animation.stop(ani,o.animate.times);
		if(last.name = ani && !last.isCompleted){
			last.lt = last._time;
			DragonBones.anims.set(o,{time:last._time,name:ani,isCompleted:false});
			o.anicallback("stop",ani);
		}
	}
	/**
	 * @description 移除显示对象
	 * @param { Ni }o 高层动画封装
	 */
	static remove(o){
		if(DragonBones.anims.get(o)){
			DragonBones.anims.delete(o);
		}
	}
}
/****************** 本地 ******************/
/****************** 立即执行 ******************/
//绑定资源监听
Loader.addResListener("addDragonData",DragonBones.addDragonData);