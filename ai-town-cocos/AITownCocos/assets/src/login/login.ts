import { _decorator, Component, Node, director, Label, view, resources, ProgressBar, EditBox, Sprite, randomRangeInt } from "cc";
const { ccclass, property } = _decorator;
import { tizhuanMgr } from "../../src/manager/TiaozhuanManager";
import { showMsg2 } from "../../src/core/message/MessageManager";
import App, { appInit, mduManger, modelMgr, observer, socket } from "../../src/game/App";
import mGameConfig from "../../src/utils/MGameConfig";
import WebUtils from "../../src/utils/WebUtils";
import { GlobalConfig } from "../../src/game/config/GlobalConfig";
import { network } from "../../src/model/RequestData";
import { EventType } from "../../src/EventType";
import Log from '../../src/utils/LogUtils'
import { NPCPartBaseDataMap } from "../NPC/NPCControl";
import { RolePartIcon } from "../StaticUtils/NPCConfig";
import loginModel from "../model/loginModel";
export let Axios;
export let NeteaseGame;
export let yyygame;
const treePos = -480
const treeAdapt = [
  2.75,
  2.75,
  2.5,
  2.5,
  2,
  2,
]

const rabbit_x =[
  0,
  -66,
  -133,
  -200,
]

export const MAX_LENGTH = 1

const cloudPos = -620
const cloudAdapt = [
  1.5,
  1,
  1.75,
  0.5
]

const BgStartPos = [
  {x: 35, y: -225},
  {x: -956, y: -225},
  {x: -1945, y: -225},
  {x: -2940, y: -225},
  {x: 35, y: 330},
  {x: -956, y: 330},
  {x: -1945, y: 330},
  {x: -2940, y: 330},
]

const CowBabyPos = [
  {x: 0, y: 0},
  {x: -25, y: 0},
  {x: -54, y: 0},
  {x: -80, y: 0},
  {x: -80, y: 31},
  {x: -54, y: 31},
  {x: -25, y: 31},
  {x: 0, y: 31},
]

const CowBlackPos = [
  {x: 0, y: 0},
  {x: -50, y: 0},
  {x: -100, y: 0},
  {x: -150, y: 0},
  {x: -150, y: -62},
  {x: -100, y: -62},
  {x: -50, y: -62},
  {x: 0, y: -62},
]

const CowPos = [
  0,
  -24,
  -47,
  -72
]

/**
 * 1.登录验证/登录逻辑
 * 2.登录页/loading页
 * 3.活动未开启/开启/结束状态处理
 * 4.游戏首接口home 接口
 * 5.微信qq 分享文案
 */
const TAG = 'Index'
@ccclass("Index")
export default class Index extends Component {

  @property(Node)
  public loginview: Node;
  @property({ type: ProgressBar })
  prg: ProgressBar | null = null;
  @property(EditBox)
  public edit_name: EditBox = null;

  @property(Node)
  public icon: Node;

  @property(Node)
  public loginView: Node;

  @property(Node)
  public createRoleView: Node;

  @property(Node)
  public infoView: Node;

  @property(Node)
  public starBg: Node;

  @property(Node)
  public cow: Node;

  @property(Node)
  public cowBaby: Node;

  @property(Node)
  public cowBlack: Node;

  @property(Node)
  public cowBabyRoot: Node;

  @property(Node)
  public cowBlackRoot: Node;

  @property({type:[Node]})
  public cloud:Node[] = [];

  @property({type:[Node]})
  public trees:Node[] = [];

  @property(Node)
  public rabbit: Node;

  @property(Node)
  public loading: Node;

  //人物选择的部分Icon信息
  currentIndex: 0
  currentPartName: string = 'hair'
  frameTime15 = 0

  frameTime10 = 0

  starIndex: number = 0 //星星闪动的index
  cowIndex: number = 0 //奶牛的index

  cowBabyIndex: number = 0 //小牛的index
  cowBlackIndex: number = 0 //走路的奶牛的index
  npcBasePartInfo: NPCPartBaseDataMap = {
    body: 0,
    hair: {
        sexy: 'man',
        index: 0
    },
    pants: 0,
    shirt: 0
  }
  rabbit_index: number = 0;
  addFrameRabbit: number = 0;

  constructor() {
    super();
  }
  async start() {
    //this.loginview.active = true;
    let s = this;
    tizhuanMgr.hideloading();
    mGameConfig.DeviceW = view.getVisibleSize().width;
    mGameConfig.DeviceH = view.getVisibleSize().height;
    mGameConfig.DesginW = view.getVisibleSize().width;
    mGameConfig.DesginH = view.getVisibleSize().height;
    await this.goLogin()
  }

  protected update(dt: number): void {
      this.frameTime15 = this.frameTime15 + dt
      this.frameTime10 = this.frameTime10 + dt
      this.addFrameRabbit = this.addFrameRabbit + dt
      if(this.frameTime15 >= 0.15){
        this.starBg.setPosition(BgStartPos[this.starIndex].x, BgStartPos[this.starIndex].y)
        this.starIndex = this.starIndex >= 7 ? 0 : this.starIndex + 1

        this.cow.setPosition(CowPos[this.cowIndex], 0)
        this.cowIndex = this.cowIndex >= 3 ? 0 : this.cowIndex + 1

        this.frameTime15 = 0
      }

      if(this.addFrameRabbit >= 0.10){

        this.rabbit.setPosition(rabbit_x[this.rabbit_index], 0)
        //this.cow.setPosition(cow_x[this.flower_cow_index], 0)
        this.rabbit_index = this.rabbit_index >= 3 ? 0 : this.rabbit_index + 1

        this.addFrameRabbit = 0
    }

      if(this.frameTime10 >= 0.3){
        this.cowBaby.setPosition(CowBabyPos[this.cowBabyIndex].x, CowBabyPos[this.cowBabyIndex].y)
        this.cowBabyIndex = this.cowBabyIndex >= 7 ? 0 : this.cowBabyIndex + 1
        if(this.cowBaby.getPosition().y > 0){
          this.cowBabyRoot.setPosition(this.cowBabyRoot.getPosition().x, this.cowBabyRoot.getPosition().y + 5)
        }else{
          this.cowBabyRoot.setPosition(this.cowBabyRoot.getPosition().x, this.cowBabyRoot.getPosition().y - 5)
        }

        this.cowBlack.setPosition(CowBlackPos[this.cowBlackIndex].x, CowBlackPos[this.cowBlackIndex].y)
        this.cowBlackIndex = this.cowBlackIndex >= 7 ? 0 : this.cowBlackIndex + 1
        if(this.cowBlack.getPosition().y < 0){
          this.cowBlackRoot.setPosition(this.cowBlackRoot.getPosition().x - 5, this.cowBlackRoot.getPosition().y)
        }else{
          this.cowBlackRoot.setPosition(this.cowBlackRoot.getPosition().x + 5, this.cowBlackRoot.getPosition().y)
        }

        this.frameTime10 = 0
      }

      this.cloud.forEach((currentCloud, index)=>{
        if(currentCloud.getPosition().x < cloudPos){
          currentCloud.setPosition(-cloudPos, currentCloud.getPosition().y)
        }
        currentCloud.setPosition(currentCloud.getPosition().x - cloudAdapt[index], currentCloud.getPosition().y)
      })


      this.trees.forEach((tree, index)=>{
        if(tree.getPosition().x > -treePos){
            tree.setPosition(treePos, tree.getPosition().y)
        }
        tree.setPosition(tree.getPosition().x + treeAdapt[index], tree.getPosition().y)
      })
  }



  public async getlogin() {
    let json = new network.LoginRequest();
    json.requestId = 0;
    json.type = 1;
    json.command = 10000;
    json.data.avatar = "";
    json.data.clientOs = "";
    json.data.loginType = 0;
    let idString
    if(localStorage.getItem('visitor')){
      idString = localStorage.getItem('visitor')
    }else{
      idString = Date.now().toString();
      localStorage.setItem('visitor', idString)
    }
    GlobalConfig.instance.userId = GlobalConfig.instance.nickName = GlobalConfig.instance.playername = idString
    json.data.name = GlobalConfig.instance.playername;
    json.data.nickName = GlobalConfig.instance.nickName;
    json.data.userId = GlobalConfig.instance.userId;
    json.data.password = "123";
    json.data.timeZone = 0;
    socket.sendWebSocketBinary(json);
    //this.loading.active = true
  }
  public onDestroy() {
    observer.off(EventType.SOCKET_ONOPEN, this.getlogin, this);
    observer.off(EventType.SOCKET_ONMESSAGE, this.hasLogin, this);
  }


  public hasLogin(da: any) {
    let data: network.InetwarkResponseData = da.data;
    if (data && data.command == 10000 && data.code == 0) {
      //loginModel.character = data.player.character 
      GlobalConfig.instance.hasLogin = true;
      GlobalConfig.instance.LoginData = data as network.LoginResponse;
      loginModel.character = GlobalConfig.instance.LoginData.data.player.charater
      //显示loading页
      //this.loginview.active = false;
      //this.loadingview.active = true;
      //预加载场景并获得加载进度

      director.preloadScene('town', (completedCount, totalCount, item) => {
        //可以把进度数据打出来
        //this.prg?.progress && (this.prg.progress = completedCount / totalCount);

      }, () => {
        this.scheduleOnce(() => {
          Log.log(TAG, 'Enter Game HomePage')
          
          tizhuanMgr.checkEntrance();
        }, 0);
      });
    }
  }



  public gotoHome() {
    if (this.edit_name.string) {
      GlobalConfig.instance.nickName = GlobalConfig.instance.playername = GlobalConfig.instance.userId = this.edit_name.string;
    }
    return;
  }
  /**
   * 按钮登录点击，
   * @returns 
   */
  public async goLogin() {
    if (!this.edit_name.string) {
      //showMsg2("Please enter your email account.");
      //return;
    }
    this.loading.active = true
    if (GlobalConfig.instance.hasInitGame == false) {
      // const debounceThings = WebUtils.debounce(()=>{
        let app = new App();
        app.init();
        appInit(app);
        Log.log(TAG, 'main init start ...')
        mduManger.start();
        modelMgr.configModel.loadResDir();
        observer.on(EventType.SOCKET_ONOPEN, this.getlogin, this);
        observer.on(EventType.SOCKET_ONMESSAGE, this.hasLogin, this);
      // }, 2)
      // debounceThings()
    }
  }

  setCurrentPart(data, event){
    if(this.currentIndex + data > MAX_LENGTH || this.currentIndex + data < 0){
      return
    }
    this.currentIndex = this.currentIndex + data
    WebUtils.getResouceImg(RolePartIcon[this.currentPartName][this.currentIndex], this.icon)
  }



}
