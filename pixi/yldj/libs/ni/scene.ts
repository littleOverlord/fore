/****************** 导入 ******************/
import * as PIXI from '../pixijs/pixi';
import Loader from "./loader";
import Frame from './frame';
import Animate from './animate';
import { Events } from './events';
import DragonBones from './dragonbones';
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
	static root
	// fps node
	static FPS = (():any=>{
		let m: any = {},
			c = 0,
			t = Date.now();
		m.loop = () => {
			c += 1;
			if(Date.now() - t >= 1000){
				if(m.node){
					m.node.text = `FPS ${c}`;
				}
				c = 0;
				t = Date.now();
			}
		}
		m.node = null;
		return m;
	})()
	// object cache
	static cache = {}
	//SpriteSheets
	static spriteSheets = {}
	/**
	 * @description create scene
	 */
	static Application(option,cfg){
		initCanvas(option,cfg);
		// option.sharedTicker = false;
		// option.sharedLoader	= false;
		app = new Application(option);
		app.ticker = null;
		//映射pixi坐标
		app.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
			point.x = x * cfg.screen.scale - cfg.screen.left;
			point.y = y * cfg.screen.scale - cfg.screen.top;
		}
		//创建根节点
		this.root = new Container();
		this.root.width = cfg.screen.width;
		this.root.height = cfg.screen.height;
		// this.root.position.set(cfg.screen.left,cfg.screen.top);
		Events.bindGlobal(this.root);
		app.stage.addChild(this.root);
		this.root.calculateBounds();
		//FPS
		this.FPS.node = new Text("FPS 0",{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010,strokeThickness:2});
		this.FPS.node.position.set(15,115);
		app.stage.addChild(this.FPS.node);

		this.screen = cfg.screen;
		//添加主循环
		Frame.add(function(){
			Scene.FPS.loop();
			app.render();
			Events.loop();
			DragonBones.update();
		});
		console.log(PIXI.spine);
		return app;
	}
	/**
	 * @description 打开组件,w 与 logic配合使用，用来分离显示逻辑和业务逻辑
	 * @param option 渲染数据，同create
	 * @param w 组件，主要响应组件逻辑事件
	 * @param parent 父显示对象
	 * @param logic 应用层对象，主要用来响应业务逻辑事件
	 */
	static open(name: string,parent: any,logic?:any,props?:any): any{
		let w = Widget.factory(name,name,props),
			o = Scene.create(null,w,parent,logic);
		w.added(o);
		return o;
	}
	/**
	 * 
	 * @param {object} option {type:"sprite || container || particleContainer",data:{}}
	 * @return {} 创建渲染对象
	 * @example {
		* 	type:"sprite || container || particleContainer || text || animatedSprite || widget name" ,
		*	script: "app-ui-name", // wiget 类
		*	prop: {}, // widget 专用
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
	static create(option: any,w: Widget,parent: any,logic?:any){
		let o,i,leng;
		option = option || w.cfg;
		w = w || parent.widget;
		parent = parent || app.stage;
		if(!creater[option.type]){
			w = Widget.factory(option.type,option.script||option.type,option.props);
			o = Scene.create(null,w,parent,logic);
			w.added(o);
		}else{
			o = creater[option.type](option.data,parent);
			o.widget = w;
			o.logic = logic;
			parent.addChild(o);
			Scene.addCache(o);
			Events.bindEvent(o,option);
			o.ni.resize();
			o.on("removed",function(pr){
				if(this.ni.animate){
					this.stop();
				}
				if(this.ni.id){
					// console.log(`Delete the node which id is ${this.ni.id} from cache!!`);
					o.widget.elements.delete(o.ni.id);
				}
				if(this.ni.type === "dragonbones"){
					DragonBones.remove(this.ni);
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
		let isTop;
		if(obj.parent){
			isTop = obj.widget != obj.parent.widget;
			obj.parent.removeChild(obj);
			if(isTop){
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
	/**
	 * @description 根据spritesheet json 创建 PIXI.Spritesheet
	 * @param data spritesheet json
	 */
	static createSpriteSheets(data){
		for(let k in data){
			let texture = Loader.resources[k.replace(".json",".png")].texture.baseTexture;
			Scene.spriteSheets[k] = new Spritesheet(texture,JSON.parse(data[k]));
			Scene.spriteSheets[k].parse(function(sps){
				console.log(sps);
			});
			delete data[k];
		}
		console.log(Scene.spriteSheets);
		console.log(PIXI.loader);
	}
	/**
	 * @description 根据图片路径获取spriteSheets
	 * @param path like "app/images/arms/1222.png"
	 */
	static getTextureFromSpritesheet(path){
		let m = path.match(/(\/[^\/\.]+)\.(png|jpg)/),
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
	/**
	 * @description 获取对象全局位置
	 * @returns PIXI.Rectangle
	 */
	static getGlobal(o){
		let r = new Rectangle(),g = o.toGlobal(new Point(0,0),null,true);
		r.width = o.width;
		r.height = o.height;
		r.x = g.x;
		r.y = g.y;
		return r;
	}
}
/****************** 本地 ******************/
let Application = PIXI.Application,
		Container = PIXI.Container,
		TextureCache = PIXI.utils.TextureCache,
		Sprite = PIXI.Sprite,
		Rectangle = PIXI.Rectangle,
		Text = PIXI.Text,
		Spritesheet = PIXI.Spritesheet,
		AnimatedSprite = PIXI.extras.AnimatedSprite,
		Point = PIXI.Point,
		Graphics = PIXI.Graphics,
		//当前渲染实例 new PIXI.Application()
		app;
class Ni{
	//resize的定时器,连续改变，将会只更新一次
	private rsTimer

	public _width
	public _height
	public _left
	public _top
	public _bottom
	public _right
	public z = 0
	public id = ""
	//显示对象
	public show
	/**
	 * @description 帧动画动作列表
	 */
	public actions = {}
	/**
	 * @description 画状态表
	 */
	public animate ={"ani":"","times":0,"speed":1} // times 0: 无限循环播放, [1~N]: 循环播放 N 次
	/**
	 * @description 创建应用层管理对象
	 * @param show 显示对象
	 * @param cfg 显示配置
	 */
	constructor(show: any,cfg: any, public type: string, parent: any){
		let isAni = false;
		if(cfg.z){
			this.z = cfg.z;
		}
		if(cfg.id){
			this.id = cfg.id;
		}
		this._width = cfg.width;
		this._height = cfg.height;
		this._left = cfg.left;
		this._top = cfg.top;
		this._bottom = cfg.bottom;
		this._right = cfg.right;
		for(let k in this.animate){
			if(cfg[k] != undefined){
				this.animate[k] = cfg[k];
				isAni = true;
			}
		}
		if(!isAni){
			this.animate = null;
		}
		if(cfg.anicallback){
			this.anicallback = cfg.anicallback;
		}
		this.show = show;
		this.resize(parent);
	}
	/**
	 * @description 延迟resize执行
	 */
	private delayRS(){
		let _this = this;
		if(this.rsTimer){
			return;
		}
		this.rsTimer = setTimeout(() => {
			_this.resize();
			this.rsTimer = null;
		}, 0);
	}
	/**
	 * 
	 * @param status 
	 * @param ani 
	 */
	private setBound(key: string,val: any){
		if(this[key] == val){
			return;
		}
		this[key] = val;
		this.delayRS();
	}
	/**
	 * @description 动画回调
	 */
	public anicallback(status: string,ani: string){

	}
	/**
	 * @description 播放骨骼动画
	 */
	public play(ani: string = this.animate.ani,times: number = this.animate.times){
		if(this.type !== "dragonbones"){
			return;
		}
		this.animate.ani = ani;
		this.animate.times = times;
		DragonBones.play(this);
	}
	/**
	 * @description 暂停骨骼动画
	 */
	public stop(ani: string = this.animate.ani){
		if(this.type !== "dragonbones"){
			return;
		}
		DragonBones.stop(ani,this);
	}
	/**
	 * @description 重新计算位置大小
	 */
	public resize(parent?: any){
		let x,y,w,h,l,r,t,b,
			parseNumber = (s: any,b?: number):number=>{
				if(typeof s === "string"){
					s = s.replace("%","");
					s = Number(s);
					if(b){
						s = b*(s/100);
					}
				}
				return s;
			};
		parent = parent || this.show.parent;
		w = parseNumber(this._width,parent._width);
		h = parseNumber(this._height,parent._height);
		l = parseNumber(this._left,parent._width);
		r = parseNumber(this._right,parent._width);
		t = parseNumber(this._top,parent._height);
		b = parseNumber(this._bottom,parent._height);
		if(l !== undefined){
			x = l;
		}
		if(r !== undefined){
			if(x !== undefined){
				w = parent._width - x - r;
			}else{
				x = parent._width - this.show.width - r;
			}
		}
		if(t !== undefined){
			y = t;
		}
		if(b !== undefined){
			if(y !== undefined){
				h = parent._height - y - b;
			}else{
				y = parent._height - this.show._height - b;
			}
		}
		w = w !== undefined?w:this._width;
		h = h !== undefined?h:this._height;
		w !== undefined && (this.show.width = w);
		h !== undefined && (this.show.height = h);
		this.show.position.set(x || 0, y || 0);
	}
	get top(){
		return this._top;
	}
	set top(val){
		this.setBound("_top",val);
	}
	get left(){
		return this._left;
	}
	set left(val){
		this.setBound("_left",val);
	}
	get right(){
		return this._right;
	}
	set right(val){
		this.setBound("_right",val);
	}
	get bottom(){
		return this._bottom;
	}
	set bottom(val){
		this.setBound("_bottom",val);
	}
	get width(){
		return this._width;
	}
	set width(val){
		this.setBound("_width",val);
	}
	get height(){
		return this._height;
	}
	set height(val){
		this.setBound("_height",val);
	}
}
/**
 * @description 渲染对象创建器
 */
const creater = {
	/**
	 * @description 初始化默认属性
	 */
	init: (type: string,o: any,data: any,parent: any) => {
		o.ni = new Ni(o,data,type,parent);
		o.alpha = data.alpha || 1;
		if(data.anchor != undefined){
			o.anchor.x = data.anchor[0];
			o.anchor.y = data.anchor[1];
		}
		data.rotation != undefined && (o.rotation = data.rotation);
	},
	/**
	 * @description 创建 PIXI.Container
	 */
	container: (data: any, parent: any) => {
		let o = new Container();
		creater.init("container",o,data,parent);
		return o;
	},
	/**
	 * @description
	 * @param data {
	 * 	width:0
	 * 	height:0
	 * 	x:0
	 * 	y:0
	 * 	border-color:0xFF3300
	 * 	border-width:0
	 * 	border-alpha:1
	 * 	border-align:0.5
	 * 	background-color:0x66CCFF
	 * 	background-alpha:1
	 * }
	 */
	rect: (data: any, parent: any) => {
		let rectangle = new Graphics();
		creater.init("rect",rectangle,data,parent);
		rectangle.lineStyle(data["border-width"]||0, data["border-color"]||0, data["border-alpha"]||1, data["border-align"]||0.5);
		rectangle.beginFill(data["background-color"]||0,data["background-alpha"]||(data["background-color"]?1:0.0001));
		rectangle.drawRect(0, 0, rectangle._width,rectangle._height);
		rectangle.endFill();
		return rectangle;
	},
	/**
	 * @description 创建 PIXI.Sprite
	 */
	sprite: (data: any, parent: any) => {
		let t = Scene.getTextureFromSpritesheet(data.url),o;
		if(!t){
			throw `Can't create the sprite by "${data.url}"`;
		}
		
		o = new Sprite(t);
		//根据中心点调整sprite位置
		if(t.defaultAnchor.x || t.defaultAnchor.y){
			o.position.set((data.x || 0)-data.width*t.defaultAnchor.x,(data.y || 0) - data.height*t.defaultAnchor.y);
		}
		creater.init("sprite",o,data,parent);
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
	text: (data: any, parent: any) => {
		let o = new Text(data.text,data.style);
		creater.init("text",o,data, parent);
		return o;
	},
	/**
	 * @description 创建帧动画
	 * @param data {
	 * 		...,
	 * 		ani: "",
	 * 		once: false,
	 * 		speed: 1, 越高越快，越低越慢,
	 * 		actions: {"standby":[0,5],...}//每个动作配置帧数区间，左右都是闭区间
	 * 		anicallback: function(e){} //e string "complete" 
	 * 	}
	 */
	animatedSprite: (data: any, parent: any) => {
		if(!Scene.spriteSheets[data.url]){
			return console.error(`Can't find the spriteSheet by "${data.url}".`);
		}
		let m = data.url.match(/\/([^\/\.]+)\./),
			o = new AnimatedSprite(Scene.spriteSheets[data.url].animations[m[1]]);
		creater.init("animatedSprite",o,data,parent);
		o.animationSpeed = data.speed;
		o.ni.actions = Scene.spriteSheets[data.url].data.actions || {};
		
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
	},
	/**
	 * @description 创建dragonbones
	 */
	dragonbones: (data: any, parent: any)=>{
		let o = DragonBones.create(data);
		if(!o){
			return console.error(`Can't find the dragonbones data by "${data.url}".`);
		}
		creater.init("dragonbones",o,data,parent);
		o.ni.play();
		return o;
	}
}
/**
 * @description 初始化canvas
 * @param option 
 */
const initCanvas = (option,cfg) => {
	if(option.view){
		return;
	}
	let timer,cacl = () => {
		let maxTime = 1.5, curr;
		
		if(cfg.screen.width / cfg.screen._width > maxTime){
			curr = maxTime * cfg.screen._width;
			cfg.screen.left = (cfg.screen.width - curr)/2;
			cfg.screen.width = option.width = curr;
			
		}
		if(cfg.screen.height / cfg.screen._height > maxTime){
			curr = maxTime * cfg.screen._height;
			cfg.screen.top = (cfg.screen.height - curr)/2;
			cfg.screen.height = option.height = curr;
		}
		option.view.setAttribute("style",`position:absolute;left:50%;top:50%;margin-left:-${cfg.screen.width/2}px;margin-top:-${cfg.screen.height/2}px;-webkit-transform:scale(${1/cfg.screen.scale},${1/cfg.screen.scale});-moz-transform:scale(${1/cfg.screen.scale},${1/cfg.screen.scale});-ms-transform:scale(${1/cfg.screen.scale},${1/cfg.screen.scale});transform:scale(${1/cfg.screen.scale},${1/cfg.screen.scale});`);
	};
	option.view = document.createElement("canvas");
	cacl();
	document.body.appendChild(option.view);
	window.onresize = () => {
		if(timer){
			return;
		}
		timer = setTimeout(() => {
			timer = null;
			let windowWidth = document.documentElement.clientWidth ||  document.body.clientWidth, windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
			let w,h,
				sw = cfg.screen._width/windowWidth,
				sh = cfg.screen._height/windowHeight,
				s = Math.max(sw,sh);
			w = windowWidth * s;
			h = windowHeight * s;
			cfg.screen.width = w;
			cfg.screen.height = h;
			cfg.screen.scale = s;
			cacl();
			app.renderer.resize(cfg.screen.width, cfg.screen.height);
			Scene.root.width = cfg.screen.width;
			Scene.root.height = cfg.screen.height;
			Scene.root.position.set(0,0);
			resizeNode(Scene.root);
		}, 100);
	} 
}
/**
 * @description resize all render
 * @param node render node
 */
const resizeNode = (node) => {
	let children = node.children;
	for(let i = 0,len = children.length;i < len; i++){
		if(children[i].ni){
			children[i].ni.resize();
		}
		if(children[i].children){
			resizeNode(children[i]);
		}
	}
}
/****************** 立即执行 ******************/
//绑定资源监听
Loader.addResListener("createSpriteSheets",Scene.createSpriteSheets)