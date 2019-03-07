import './libs/wx/weapp-adapter';
import './depend';

import Config from "./config";
import Main from './app/main';
declare const wx;
new Main(new Config(wx.getSystemInfoSync()));
