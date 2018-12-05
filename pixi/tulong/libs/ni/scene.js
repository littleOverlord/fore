import * as PIXI from '../pixijs/pixi.min';

let Application = PIXI.Application,
        Container = PIXI.Container,
        resources = PIXI.loader.resources,
        TextureCache = PIXI.utils.TextureCache,
        Sprite = PIXI.Sprite,
				Rectangle = PIXI.Rectangle;
const creater = {
	container: (data) => {
		let o = new PIXI.Container();
		o.width = data.width;
		o.height = data.height;
		o.position.set(data.x || 0, data.y || 0);
		return o;
	},
	sprite: (data) => {
		let o = new Sprite(resources[data.url].texture);
		o.width = data.width;
		o.height = data.height;
		o.position.set(data.x || 0, data.y || 0);
		return o;
	}
}
export default class Scene {
	static app;
	static root = new Container();
	/**
	 * @description create scene
	 */
	static Application(option,cfg){
		this.app = new Application(option);
		//映射pixi坐标
		this.app.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
				point.x = x * cfg.screen.scale;
				point.y = y * cfg.screen.scale;
		}

		this.root.width = cfg.screen.width;
		this.root.height = cfg.screen.height;
		this.root.position.set(cfg.screen.left,cfg.screen.top);
		
		this.app.stage.append(this.root);
	}
	/**
	 * 
	 * @param {object} option {type:"sprite || container || particleContainer",data:{}} 
	 */
	static create(option,parent){
		let o = creater[option.type](option.data);
		if(parent){
			parent.addChild(o);
		}else{
			this.root.addChild();
		}
		return o;
	}
}