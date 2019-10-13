import './libs/bd/swan-adapter';
import './libs/bd/api';

import Config from "./config";
import Fs from "./libs/ni/fs";
import Http from "./libs/ni/http";
import Main from './app/main';

import  "./depend";
import "./libs/bd/fs";

declare const swan;
const cfg = new Config(swan.getSystemInfoSync());
if(cfg.localRes){
    Fs.init(cfg,()=>{});
    new Main(cfg);
}else{
    Http.get(`${cfg.remote}/${cfg.name}/depend.json`,"","",(err,data)=>{
        if(err){
            return console.log(err)
        }
        let depend = JSON.parse(data);
        Fs.parseDepend(depend);
        Fs.init(cfg,()=>{
            new Main(cfg);
        })
        
    })
}
