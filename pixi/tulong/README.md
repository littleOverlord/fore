# 项目

## 工具

    TexturePacker : 打包sprite图，生成sprite动画json

## 源码目录介绍
```
./libs
├── pixijs                                   // pixijs 渲染引擎
│   ├── pixi.js                       // 帧动画的简易实现
│   └── pixi.min.js                          // 游戏基本元素精灵类
└── wx                                     //微信小游戏兼容
    └── weapp-adapter.js                   // 小游戏适配器
./app
├── xx                                   // 功能
│   ├── xx.js                       // 功能js
│   └── xx.js                          // 功能js
└── main.js                                     //游戏启动
```
## 待做功能

### sprite分组
```
方案1：PIXI.Container 里面的sprite含有所有sprite该有的属性
方案2：PIXI.particles.ParticleContainer 里面的sprite只含有x, y, width, height, scale, pivot, alpha, visible属性,且sprite不能嵌套子sprite

实现页面层级关系, 同时方便对一组sprite做批量操作, 且每个层级配置自己的显示属性。
如：bg main secondary cover ... 
```
### 全屏适配
```
实现sprite Container ParticleContainer的left top right bottom 属性

```
### 滚动
```
let gra = new PIXI.Graphics();
container.mask = gra;
...
```
### 组件封装
```
把pixi的每个displayObject 封装一遍，用get set 来完成显示对象更新，同时满足自定义组件的逻辑
...
```

## 坑
```
微信小游戏图片尺寸长宽都必须小于2048
```