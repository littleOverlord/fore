var ni_modules = {};
(function(){
    var commonjs = {name:"commonjs",exports:{},loaded:true},
        wait = [];
    /**
     * @description 资源服务器
     */
    commonjs.exports.domain = "";
    /**
     * @description 单个js文件加载
     */
    commonjs.exports.loadJs = function(path,callback){
        var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement,
        node = document.createElement("script");
        node.async = true;
        node.crossorigin = true;
        node.charset = "utf8";
        node.src = path;
        node.onload = function(){
            head.removeChild(node);
            callback(null,path);
        }
        node.onerror = function(e){
            head.removeChild(node);
            callback(e,path);
            console.log(e);
        }
        head.appendChild(node);
    }
    /**
     * @description 加载模块
     * @param {Array}arr  ["app/game",...]
     */
    commonjs.exports.load = function(arr,callback){
        var arr = commonjs.exports.findDepends(arr),building = [],name,fileMap = {},
            rpath = function(path){
                let data = fileMap[path];
                if(data){
                    var blob = new Blob([data], { type: "application/javascript" });
		            return URL.createObjectURL(blob);
                }
                return `${commonjs.exports.domain}/${path}`;
            },start = function(){
                for(var i = 0,len = arr.length; i < len; i++){
                    name = arr[i].replace(".js","");
                    if(ni_modules[name]){
                        continue;
                    }
                    building.push(name);
                    commonjs.exports.create(name);
                    commonjs.exports.loadJs(rpath(arr[i]),function(){});
                }
                wait.push({
                    mods:building,
                    count: building.length,
                    callback:callback
                })
            };
        commonjs.exports.useFs(function(fs){
            fs.exports.default.read(arr,function(map){
                fileMap = map;
                start();
            })
        },function(){
            start();
        })
        return arr;
    }
    /**
     * @description 引用模块
     * @param {string}name 
     */
    commonjs.exports.require = function(name){
        var mod = ni_modules[name];
        if(!mod){
            throw `Don't find the module which name is ${name}`;
        }
        return mod.exports;
    }
    /**
     * @description 创建模块
     * @param {string}name 
     */
    commonjs.exports.create = function(name){
        ni_modules[name] = {name:name,exports:{},loaded:false};
        return ni_modules[name];
    }
    /**
     * @description 寻找依赖
     */
    commonjs.exports.findDepends = function(arr){
        var r = [];
        for(var i = 0, len = arr.length; i < len; i++){
            commonjs.exports.useFs(function(fs){
                fs.exports.default.depend.findModDepend(arr[i]+".js",r);
            },function(){
                r.push(arr[i]+".js");
            })
        }
        return r;
    }
    /**
     * @description 构建模块，按照依赖顺序构建
     */
    commonjs.exports.defineMod = function(mod){
        var name;
        for(var i = wait.length - 1; i >= 0; i--){
            if(wait[i].mods.indexOf(mod.name) >= 0){
                wait[i].count -= 1;
                if(wait[i].count === 0){
                    for(var ii = 0, leng = wait[i].mods.length; ii < leng; ii++){
                        name = wait[i].mods[ii];
                        ni_modules[name].func(commonjs.exports.require,ni_modules[name].exports,ni_modules[name])
                        delete ni_modules[name].func;
                    }
                    wait[i].callback && wait[i].callback();
                    wait.splice(i,1);
                }
            }
        }
    }
    /**
     * @description 使用fs模块
     */
    commonjs.exports.useFs = function(hasCallback,noCallback){
        var fs = ni_modules["libs/ni/fs"];
        if(fs && fs.loaded){
            hasCallback(fs);
        }else{
            noCallback();
        }
    }
    ni_modules.commonjs = commonjs;
})()
var define = function(name,moduleFunc){
    var mod = ni_modules[name] || ni_modules.commonjs.exports.create(name);
    mod.func = moduleFunc;
    mod.loaded = true;
    ni_modules.commonjs.exports.defineMod(mod);
}