import './libs/wx/weapp-adapter'

import Config from "./config"
import Main from './app/main'

new Main(new Config(wx.getSystemInfoSync()))
