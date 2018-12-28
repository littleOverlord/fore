/****************** 导入 ******************/
import * as PIXI from '../pixijs/pixi.min';
import Frame from './frame';
import Animate from './animate';
import Events from './events';
import Widget from './widget';
/****************** 导出 ******************/
export default class Scene {
	// render
	static app = function(){
		return app;
	};
	//屏幕尺寸
	static screen
	// root node
	static root;
	// object cache
	static cache = {}
	//SpriteSheets
	static spriteSheets = {}
	/**
	 * @description create scene
	 */
	static Application(option,cfg){
		app = new Application(option);
		//映射pixi坐标
		app.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
				point.x = x * cfg.screen.scale;
				point.y = y * cfg.screen.scale;
		}
		this.root = new Container();
		this.root.width = cfg.screen._width;
		this.root.height = cfg.screen._height;
		this.root.position.set(cfg.screen.left,cfg.screen.top);
		Events.bindGlobal(this.root);

		this.screen = cfg.screen;
		
		app.stage.addChild(this.root);

		Frame.add(function(){
			app.render();
			Events.loop();
		});
		return app;
	}
	/**
	 * @description 打开组件,w 与 logic配合使用，用来分离显示逻辑和业务逻辑
	 * @param option 渲染数据，同create
	 * @param w 组件，主要响应组件逻辑事件
	 * @param parent 父显示对象
	 * @param logic 应用层对象，主要用来响应业务逻辑事件
	 */
	static open(name: string,parent: any,logic?:any): any{
		let w = Widget.factory(name),
			o = Scene.create(null,w,parent,logic);
		w.added();
		return o;
	}
	/**
	 * 
	 * @param {object} option {type:"sprite || container || particleContainer",data:{}}
	 * @return {} 创建渲染对象
	 * @example {
		* 	type:"sprite || container || particleContainer || text || animatedSprite" ,
		* 	data:{
		* 		id:"",
		* 		url: "images/xx.png",
		* 		width: 10,
		* 		height: 10,
		* 		x: 0,
		* 		y: 0,
		* 		z: 0
		* 	},
		* 	children: [
		* 		{type:"",data:{},children:[]},
		* 		{}
		* 	]
		* } 
		*/
	static create(option: any,w: Widget,parent: any,logic:any){
		let o,i,leng;
		option = option || w.cfg;
		parent = parent || app.stage;
		if(!creater[option.type]){
			w = Widget.factory(option.type);
			o = Scene.create(null,w,parent,logic);
			w.added();
		}else{
			o = creater[option.type](option.data);
			o.widget = w;
			o.logic = logic;
			parent.addChild(o);
			Scene.addCache(o);
			Events.bindEvent(o,option);
			o.on("removed",function(pr){
				if(this.ni.animate){
					this.stop();
				}
				if(this.ni.id){
					console.log(`Delete the node which id is ${this.ni.id} from cache!!`);
					o.widget.elements.delete(o.ni.id);
				}
			})
			if(option.children && option.children.length){
				for(i=0, leng = option.children.length; i < leng; i++){
					Scene.create(option.children[i],w,o,logic);
				}
			}
			parent.children.sort(function(a,b){
				return a.ni.z - b.ni.z;
			});
		}
		return o;
	}
	/**
	 * 
	 * @param {*} obj 
	 */
	static addCache(o){
		if(o.ni.id){
			o.widget.elements.set(o.ni.id,o);
		}
	}
	/**
	 * @description 移除渲染对象
	 * @param obj 渲染对象
	 */
	static remove(obj){
		if(obj.parent){
			obj.parent.removeChild(obj);
			if(obj.widget != obj.parent.widget){
				obj.widget.destory();
			}
		}else{
			throw "removeChild fail";
		}
	}
	/**
	 * @description 在某个节点上绑定事件
	 */
	static bindEvent(param: any,type,func){
		let o = typeof param == "string"?this.cache[param]:param;
		if(!o){
			return console.error(`The node is not find by ${param}`);
		}
		o.interactive = true;
		o.on(type,func);
	}
	/**
	 * @description 更新texture
	 */
	static modifyTexture(param,name){
		if(typeof param == "string"){
			param = Scene.cache[param];
		}
		if(!param){
			return console.error(`Don't find the node!`);
		}
		param.texture = Scene.getTextureFromSpritesheet(name);
	}
	/**
	 * @description 更新lookat
	 * @param {Sprite} s
	 * @param {object} lookAt {x,y}
	 */
	static modifyLookAt(s,lookAt){
		let dif = lookAt.x - s.x,
			m2 = dif/Math.abs(dif);
		s.scale.x = Math.abs(s.scale.x)*m2;
	}
	static createSpriteSheets(data){
		for(let k in data){
			let texture = resources[k.replace(".json",".png")].texture.baseTexture;
			Scene.spriteSheets[k] = new Spritesheet(texture,data[k]);
			Scene.spriteSheets[k].parse(function(sps){
				console.log(sps);
			})
		}
		console.log(Scene.spriteSheets);
	}
	static getTextureFromSpritesheet(path){
		let m = path.match(/(\/[^\/\.]+)\.png/),
			name,
			t;
		if(!m){
			return console.log(`The path "${path}" isn't irregular.`);
		}
		name = path.replace(m[0],".json");
		if(!Scene.spriteSheets[name]){
			return console.log(`don't has the spriteSheet of ${name}`);
		}
		t = Scene.spriteSheets[name].textures[m[0].replace(/\//,"")]
		return t;
	}
}
/****************** 本地 ******************/
let Application = PIXI.Application,
		Container = PIXI.Container,
		resources = PIXI.loader.resources,
		TextureCache = PIXI.utils.TextureCache,
		Sprite = PIXI.Sprite,
		Rectangle = PIXI.Rectangle,
		Text = PIXI.Text,
		Spritesheet = PIXI.Spritesheet,
		AnimatedSprite = PIXI.extras.AnimatedSprite,
		//当前渲染实例 new PIXI.Application()
		app;
/**
 * @description 渲染对象创建器
 */
const creater = {
	/**
	 * @description 初始化默认属性
	 * o.ni = {
	 * 	z: number, //控制显示层级
	 * 	id: number || string //用户设置的id ，作为索引值存在Scene.cache中
	 * 	// AnimatedSprite 特有
	 *  actions: ["anctionName":[0,10],...] //动作帧段，配置在spriteSheet json中
	 * 	animate: {ani:"",default:"","speed": 1, "once": false} //default为创建时设置的ani, 在每一次一次性动画结束后，自动切换到default
	 * }
	 */
	init: (o,data) => {
		data.width !== undefined && (o.width = data.width);
		data.height !== undefined && (o.height = data.height);
		o.position.set(data.x || 0, data.y || 0);
		o.ni = {z:data.z || 0, id: data.id || ""};
		o.alpha = data.alpha || 1;
	},
	container: (data) => {
		let o = new Container();
		creater.init(o,data);
		return o;
	},
	sprite: (data) => {
		let t = Scene.getTextureFromSpritesheet(data.url),o;
		if(!t){
			throw `Can't create the sprite by "${data.url}"`;
		}
		o = new Sprite(t);
		creater.init(o,data);
		return o;
	},
	/**
	 * @param data {
	 * 	text: "",
	 * 	style: {
		* 	fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center',
		* 	wordWrapWidth:100, 换行宽度
		* 	wordWrap:true 是否换行
	 * 	}
	 * }
	 * PIXI.TextStyle http://pixijs.download/release/docs/PIXI.TextStyle.html
	 */
	text: (data) => {
		let o = new Text(data.text,data.style);
		creater.init(o,data);
		return o;
	},
	/**
	 * @description 创建动画
	 * @param data {
	 * 		...,
	 * 		ani: "",
	 * 		once: false,
	 * 		speed: 1, 越高越快，越低越慢,
	 * 		actions: {"standby":[0,5],...}//每个动作配置帧数区间，左右都是闭区间
	 * 		anicallback: function(e){} //e string "complete" 
	 * 	}
	 */
	animatedSprite: (data) => {
		if(!Scene.spriteSheets[data.url]){
			return console.error(`Can't find the spriteSheet by "${data.url}".`);
		}
		let attr = ["ani","once","speed"],
			m = data.url.match(/\/([^\/\.]+)\./),
			o = new AnimatedSprite(Scene.spriteSheets[data.url].animations[m[1]]);
		creater.init(o,data);
		o.animationSpeed = data.speed;
		o.ni.actions = Scene.spriteSheets[data.url].data.actions;
		o.ni.anicallback = data.anicallback;
		o.ni.animate = {};
		for(let i = 0,len = attr.length; i < len; i++){
			o.ni.animate[attr[i]] = data[attr[i]];
		}
		if((!o.ni.actions || o.ni.actions.length == 0) && data.once){
			o.loop = !data.once;
		}
		// Scene.animations.push(o);
		//绑定动画回调
		o.onComplete = ((obj) => {
			return ()=>{
				Animate.onComplete(obj);
			}
		})(o);
		o.onFrameChange = ((obj) => {
			return ()=>{
				Animate.onFrameChange(obj);
			}
		})(o);
		o.onLoop = ((obj) => {
			return ()=>{
				Animate.onLoop(obj);
			}
		})(o);
		//默认立即播放
		o.play();
		return o;
	}
}