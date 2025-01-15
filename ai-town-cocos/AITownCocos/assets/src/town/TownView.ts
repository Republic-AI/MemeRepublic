import {
  _decorator,
  Component,
  instantiate,
  KeyCode,
  Label,
  Node,
  TiledLayer,
  TiledMap,
  TiledObjectGroup,
  tween,
  UITransform,
  Vec2,
  Vec3,
  view,
} from "cc";
import { modelMgr, observer, socket } from "../game/App";
import { EventType } from "../EventType";
import { NPCServerD } from "../game/config/DataStruct";
import { network } from "../model/RequestData";
import WebUtils from "../utils/WebUtils";
import {
  BubbleImgUrl,
  EventNpcInfoMap,
  NpcEventType,
  NpcIndex,
  NPCPartDisplayInfo,
  ProductsItemUrl,
} from "../StaticUtils/NPCConfig";
import { frameSpeed, NPCControl } from "../NPC/NPCControl";
import _ from "lodash";
import { DataEvents, DataFarmEvent } from "../model/DataEvents";
import { PromiseUtils } from "../StaticUtils/PromiseUtils";
import { GlobalConfig } from "../game/config/GlobalConfig";
const { ccclass, property } = _decorator;
export const sleepFramePosX = [40, -61];
export const sleepFrameTime = 0.45;
export const bubbleTime = 0.7;

export const hight = 6720
// 434, 820
const PosAdapt = 1;
declare global {
  interface Window {
    farmGoSleep: any;
    farm: any;
    farmcook: any;
    farmeat: any;
    fieldReady: any;

    herdSleep: any;
    herdCook: any;
    herdDinning: any;

    bakerSleep: any;
    bakerCook: any;
    bakerDinning: any;

    GrocerSleep: any;
    GrocerCook: any;
    GrocerDinning: any;
    farmHarvest: any;
    farmStopSleep: any
  }
}
@ccclass("TownView")
export class TownView extends Component {
  @property({ type: [Node] })
  public otherNPCarr: Node[] = [];

  @property(Node)
  public player: Node = null;

  @property(Node)
  public playerInstantiate: Node = null;

  @property(Node)
  public playerLayer: Node = null;

  @property(Node)
  public playerNode: Node = null;

  @property({ type: TiledObjectGroup })
  public tileObject: TiledObjectGroup | null = null;

  @property(Node)
  public loading: Node = null;

  @property(Node)
  public farmHomeBedHead: Node = null;

  @property(Node)
  public farmHomeBedBubble: Node = null;

  @property(Node)
  public farmDinning: Node = null;

  @property(Node)
  public fieldWheat: Node = null;

  @property(Node)
  public fieldCorn: Node = null;

  @property(Node)
  public fieldCabbage: Node = null;

  @property(Node)
  public farmland1: Node = null;

  @property(Node)
  public farmland2: Node = null;

  @property(Node)
  public farmland3: Node = null;

  @property(Node)
  public farmland4: Node = null;

  @property(Node)
  public herdmanHomeBedHead: Node = null;

  @property(Node)
  public herdmanBedBubble: Node = null;

  @property(Node)
  public herdDinning: Node = null;

  @property(Node)
  public bakerHomeBedHead: Node = null;

  @property(Node)
  public bakerBedBubble: Node = null;

  @property(Node)
  public bakerDinning: Node = null;

  @property(Node)
  public grocerHomeBedHead: Node = null;

  @property(Node)
  public grocerBedBubble: Node = null;

  @property(Node)
  public grocerDinning: Node = null;

  private _curPlayerTile = new Vec2();

  _npcTileArray: Vec2[] = [];
  sleepFrameAdd = 0;
  homeBedFrameIndex = 0;

  info_farmland1 = {
    farmland: 'farmland1',
    fieldNode: null
  }

  info_farmland2 = {
    farmland: 'farmland2',
    fieldNode: null
  }

  info_farmland3 = {
    farmland: 'farmland3',
    fieldNode: null
  }

  info_farmland4 = {
    farmland: 'farmland4',
    fieldNode: null
  }

  // farmland4 = [];

  // farmland3 = [];

  // farmland1 = [];

  testFrameIndex = 0
  testbakerIndex = 0

  private _layerFloor: TiledLayer = null!;
  async start() {
    let json = new network.GetAllNPCRequest();
    json.command = 10002;
    json.type = 1;
    socket.sendWebSocketBinary(json);

    modelMgr.townModel.refreshItemDate()

    observer.on(EventType.SOCKET_GETALL_NPCS, this.setNPCPos, this);
    observer.on(EventType.SOCKET_ONLINE_NPCS, this.initOtherNPCByData, this);
    observer.on(EventType.SOCKET_OFFLINE_NPCS, this.removeNPC, this);
    //observer.on(EventType.SOCKET_NPC_MOVE, this.updateOtherPlayerInfo, this);
    observer.on(EventType.SOCKET_NPC_ACTION, this.playNPCAction, this);

    observer.on(EventType.SOCKET_ITEM_STATE_CHANGE, this.objectStateChange, this);

    observer.on(EventType.SOCKET_ITEMUPDATE, this.updateObjectStateChange, this);

    observer.on(EventType.SOCKET_ITEMUPDATE, this.updateObjectStateChange, this);

    this._layerFloor = this.node.getComponent(TiledMap).getLayer("building")!;

    // this.farmland4 = [...this.farmFieldWheat.children];

    // this.farmland3 = [...this.farmFieldCorn.children];

    // this.farmland1 = [...this.farmFieldCabbage.children];
    //!herd
    window.herdSleep = () => {
      this.playNPCAction({
        data:{
            data:        {
        bid: 10,
        actionId: 106,
        npcId: 10004,
        params: {
          oid: "breedingBed",
        },
      }
        }
      }

);
    };

    window.herdCook = () => {
      this.playNPCAction(
        
        {
            data:{
                data: {
                    bid: 11,
                    actionId: 104,
                    npcId: 10004,
                    params: {
                      oid: "breedingCook",
                      items: [
                        {
                          itemId: 10101006,
                          count: 1,
                        },
                        {
                          itemId: 10101003,
                          count: 1,
                        },
                        {
                          itemId: 10101005,
                          count: 1,
                        },
                      ],
                    },
                  }
            }
        }

);
    };

    window.herdDinning = () => {
      this.playNPCAction({
        bid: 12,
        actionId: 105,
        npcId: 10004,
        params: {
          oid: "breedingTable",
        },
      });
    };

    //!farmer

    window.farm = async () => {
      await this.playNPCAction({
        data:{
          data:{
            bid: 13,
            actionId: 100,
            npcId: 10002,
            params: {
              oid: "farmland4",
              itemId: 10101001,
            },
          }

        }

      });
    };

    window.farmHarvest = () =>{
        this.playNPCAction({
            data:{
                data:{
                    bid: 14,
                    actionId: 101,
                    npcId: 10002,
                    params: {
                      oid: "farmland4",
                      items: [
                        {
                          itemId: 10101001,
                          count: 1,
                        },
                      ]}
                }

            }
    });
    }

    window.farmGoSleep = () => {

      this.playNPCAction(        {
        data:{
            data:{
                bid: 15,
                actionId: 106,
                npcId: 10002,
                params: {
                  oid: "farmerBed",
                },
              }
        }
    });
    };

    window.farmStopSleep = ()=>{
        this.playNPCAction(        {
            data:{
                data:{
                    bid: 15,
                    actionId: 111,
                    npcId: 10002,
                    params: {
                      oid: "farmerBed",
                    },
                  }
            }
        })
    }

    window.farmcook = () => {
      this.playNPCAction({
        bid: 16,
        actionId: 104,
        npcId: 10002,
        params: {
          oid: "farmerCook",
          items: [
            {
              itemId: 10101006,
              count: 1,
            },
            {
              itemId: 10101003,
              count: 1,
            },
            {
              itemId: 10101005,
              count: 1,
            },
          ],
        },
      });
    };

    window.farmeat = () => {
      this.playNPCAction({
        bid: 17,
        actionId: 105,
        npcId: 10002,
        params: {
          oid: "farmerTable",
        },
      });
    };

    window.fieldReady = ()=>{
        this.setFieldReady({
            bid: 18,
            actionId: 105,
            npcId: 10002,
            params: {
              oid: "farmland4",
            }
        })
    }

    //!baker
    window.bakerSleep = () => {
      this.playNPCAction({
        bid: 18,
        actionId: 106,
        npcId: 10005,
        params: {
          oid: "bakerBed",
        },
      });
    };

    window.bakerCook = () => {
      this.playNPCAction({
        bid: 19,
        actionId: 104,
        npcId: 10005,
        params: {
          oid: "bakerCook",
          items: [
            {
              itemId: 10101006,
              count: 1,
            },
            {
              itemId: 10101003,
              count: 1,
            },
            {
              itemId: 10101005,
              count: 1,
            },
          ],
        },
      });
    };

    window.bakerDinning = () => {
      this.playNPCAction({
        bid: 20,
        actionId: 105,
        npcId: 10005,
        params: {
          oid: "bakerTable",
        },
      });
    };
        //!baker
        window.GrocerSleep = () => {
            this.playNPCAction({
                bid: 21,
              actionId: 106,
              npcId: 10003,
              params: {
                oid: "salerBed",
              },
            });
          };
      
          window.GrocerCook = () => {
            this.playNPCAction({
                bid: 22,
              actionId: 104,
              npcId: 10003,
              params: {
                oid: "salerCook",
                items: [
                  {
                    itemId: 10101006,
                    count: 1,
                  },
                  {
                    itemId: 10101003,
                    count: 1,
                  },
                  {
                    itemId: 10101005,
                    count: 1,
                  },
                ],
              },
            });
          };
      
          window.GrocerDinning = () => {
            this.playNPCAction({
              bid: 23,
              actionId: 105,
              npcId: 10003,
              params: {
                oid: "salerTable",
              },
            });
          };
    //await this.testFarmRound()
    //await this.testBakerRound()
    //this.tiledLayer.addUserNode(this.playerNode)
  }

  setNPCPos(NPCs: any) {
    if (!NPCs) {
      return;
    }
    this.initPlayerNPC(NPCs.data.data.myNpc);
    NPCs?.data?.data?.otherNpc && this.initOtherNPCs(NPCs.data.data.otherNpc);
  }

  async checkPlayerId(actionData){

    const item = _.find(actionData.users, (item) => {
      return item === GlobalConfig.instance.LoginData.data.player.playerId;
    });
    if(item || !actionData?.users?.length){
      return true
    }else{
      return false
    }
  }

  setNpcHomeBed(currentIndex: number) {
    this.farmHomeBedHead.setPosition(
      sleepFramePosX[currentIndex],
      this.farmHomeBedHead.getPosition().y
    );
    this.herdmanHomeBedHead.setPosition(
      sleepFramePosX[currentIndex],
      this.herdmanHomeBedHead.getPosition().y
    );
    this.bakerHomeBedHead.setPosition(
      sleepFramePosX[currentIndex],
      this.bakerHomeBedHead.getPosition().y
    );
    this.grocerHomeBedHead.setPosition(
        sleepFramePosX[currentIndex],
        this.grocerHomeBedHead.getPosition().y
      );
  }

  getPartInfo(label: string, id: number) {
    return NPCPartDisplayInfo[label]?.find((part) => part.id === id) ?? null;
  }

  //!npc睡觉相关
  getSleepNode(npcId: number) {
    switch (npcId) {
      case 10002:
        return {
          head: this.farmHomeBedHead,
          bubble: this.farmHomeBedBubble,
        };
      case 10004:
        return {
          head: this.herdmanHomeBedHead,
          bubble: this.herdmanBedBubble,
        };
      case 10005:
        return {
          head: this.bakerHomeBedHead,
          bubble: this.bakerBedBubble,
        };
      case 10003:
        return {
          head: this.grocerHomeBedHead,
          bubble: this.grocerBedBubble,
        };
        //按照id分别返回对应的node
        break;
      default:
        return {
          head: this.farmHomeBedHead,
          bubble: this.farmHomeBedBubble,
        };
        break;
    }
  }

  stopNpcSleep(npc: Node, actionData: DataEvents, cb?: () => void) {
    switch (actionData.npcId) {
      case 10002:
        this.farmHomeBedHead.active = false;
        this.farmHomeBedBubble.active = false;
        npc.active = true;
        break;
      case 10004:
        this.herdmanHomeBedHead.active = false;
        this.herdmanBedBubble.active = false;
        npc.active = true;
        break;
      case 10005:
        this.bakerHomeBedHead.active = false;
        this.bakerBedBubble.active = false;
        npc.active = true;
        break;
      case 10003:
        this.grocerHomeBedHead.active = false;
        this.grocerBedBubble.active = false;
        npc.active = true;
        break;
        //按照id分别返回对应的node
        break;
      default:
        break;
    }
  }

  npcSleep(npc: Node, head: Node, bubble: Node, cb?: () => void) {
    WebUtils.getResouceImg(
      BubbleImgUrl.sleep,
      npc.getChildByName("bubble"),
      () => {
        npc.getChildByName("bubble").active = true;
      }
    );
    this.scheduleOnce(() => {
      cb();
      head.active = true;
      bubble.active = true;
    }, bubbleTime);
  }



  //!npc做饭相关
  async npcCook(npc: Node, actionData: DataEvents, cb?: () => void) {
    for (const foodItem of actionData.params.items) {
      const food = _.find(ProductsItemUrl.ItemCfg, (item) => {
        return item.id === foodItem.itemId;
      });
      WebUtils.getResouceImg(food.url, npc.getChildByName("bubble"), () => {
        npc.getChildByName("bubble").active = true;
      });

      await PromiseUtils.wait(bubbleTime * 2000);
      WebUtils.getResouceImg(BubbleImgUrl.cook, npc.getChildByName("bubble"));

      const shouldSend = await this.checkPlayerId(actionData)

      if(shouldSend){
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = npc.getPosition().x
        json.data.y = hight - npc.getPosition().y
        json.data.isFinish = 1 
        json.data.state = 1 
        json.data.params = {
          oid: actionData.params.oid,
          itemId: actionData.params.itemId,
          count: 1,
        }
        socket.sendWebSocketBinary(json);
        await PromiseUtils.wait(bubbleTime * 2000);
      }

    }
  }

  stopCook(npc: Node, cb?: () => void) {
    npc.getChildByName("bubble").active = false;
  }

  //!吃饭相关
  async npcDinning(npc: Node, actionData: DataEvents) {
    WebUtils.getResouceImg(
      BubbleImgUrl.eating,
      npc.getChildByName("bubble"),
      () => {
        npc.getChildByName("bubble").active = true;
      }
    );
    const dinning = this.getDinning(actionData.npcId);
    WebUtils.getResouceImg(BubbleImgUrl.dinning, dinning.dinning, () => {
      dinning.dinning.active = true;
    });

    await PromiseUtils.wait(bubbleTime * 4000);
    WebUtils.getResouceImg(BubbleImgUrl.afterDinner, dinning.dinning, () => {
      WebUtils.getResouceImg(
        BubbleImgUrl.eat,
        npc.getChildByName("bubble"),
        () => {}
      );
    });
    await PromiseUtils.wait(bubbleTime * 2000);
  }

  getDinning(npcId: number) {
    switch (npcId) {
      case 10002:
        return {
          dinning: this.farmDinning,
        };
      case 10004:
        return {
          dinning: this.herdDinning,
        };
      case 10005:
        return {
          dinning: this.bakerDinning,
        };
      case 10003:
        return {
          dinning: this.grocerDinning,
        };
        //按照id分别返回对应的node
        break;
      default:
        return {
          dinning: this.farmDinning,
        };
        break;
    }
  }

  stopDinning(npc: Node, cb?: () => void) {
    npc.getChildByName("bubble").active = false;
  }

  stopActionNormal(npc: Node, actionData: DataEvents, cb?: () => void) {
    this.stopNpcSleep(npc, actionData, cb);
    npc.getChildByName("bubble").active = false;
  }

  setItemCountChange(){

  }

  //!农夫种地
  async npcFarming(npc: Node, actionData: DataEvents) {
    if(!this[actionData.params.oid]){
      return
    }



    const farmItem = _.find(ProductsItemUrl.ItemCfg, (item) => {
      return item.id === actionData.params.itemId;
    })

    const item = instantiate(this[farmItem.fieldName]) as Node;
    item.setParent(this[actionData.params.oid])
    this[`info_${actionData.params.oid}`].fieldNode = item
    item.setPosition(new Vec3(0,0,0))
    const fieldArr: Node[] = [...item.children]
    actionData.params.itemId
    
    let fieldIndexX = 1;
    let adaptX;
    let adaptY;
    for (const field of fieldArr) {
      if (fieldIndexX % 3 === 0) {
        adaptX = -1;
        adaptY = 0;
      } else {
        adaptX = 0;
        adaptY = fieldIndexX === 4 || fieldIndexX === 5 ? -1 : 1;
      }
      //?锄头气泡
      WebUtils.getResouceImg(
        BubbleImgUrl.farmerHoe,
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );

      await PromiseUtils.wait(bubbleTime * 2000);
      //?幼苗🌱出现
      field.active = true;
      await PromiseUtils.wait(bubbleTime * 2000);
      //?浇水气泡
      WebUtils.getResouceImg(
        BubbleImgUrl.farmerWater,
        npc.getChildByName("bubble")
      );
      await PromiseUtils.wait(bubbleTime * 2000);

      const startTile = this._getTilePos(
        new Vec2(npc.getPosition().x, npc.getPosition().y)
      );
      const finishTile = this._getTilePos(
        new Vec2(
          npc.getPosition().x + adaptX * 32,
          npc.getPosition().y + adaptY * 32
        )
      );
      npc
        .getChildByName("NPCinstantiate")
        .getComponent(NPCControl)
        .aStartMove(
          new Vec2(startTile.x, startTile.y),
          new Vec2(finishTile.x, finishTile.y),
          () => {
            npc
              .getChildByName("NPCinstantiate")
              .getComponent(NPCControl)
              .setNPCMoveDirect(KeyCode.KEY_A);
          }
        );

      fieldIndexX = fieldIndexX + 1;
      await PromiseUtils.wait(bubbleTime * 2000);
    }
  }

    //!农夫收
    async npcHarvest(npc: Node, actionData: DataEvents) {

      const farmItem = _.find(ProductsItemUrl.ItemCfg, (item) => {
        return item.id === actionData.params.itemId;
      })
      const item = this[`info_${actionData.params.oid}`].fieldNode
      const fieldArr: Node[] = [...item.children]
        let fieldIndexX = 1;
        let adaptX;
        let adaptY;
        for (const field of fieldArr) {
          if (fieldIndexX % 3 === 0) {
            adaptX = -2;
            adaptY = 0;
          } else {
            adaptX = 0;
            adaptY = fieldIndexX === 4 || fieldIndexX === 5 ? -2 : 2;
          }
          //?锄头气泡
          WebUtils.getResouceImg(
            BubbleImgUrl.farmerSickle,
            npc.getChildByName("bubble"),
            () => {
              npc.getChildByName("bubble").active = true;
            }
          );
    
          await PromiseUtils.wait(bubbleTime * 2000);
          //作物
          field.active = false;
          field.getChildByName('farm_wheat_l').active = false
          await PromiseUtils.wait(bubbleTime * 2000);
          //出现作物收获图标
          const food = _.find(ProductsItemUrl.ItemCfg, (item) => {
            return item.id === actionData.params.itemId;
          });
          WebUtils.getResouceImg(
            food.url,
            npc.getChildByName("bubble")
          );
          npc.getChildByName('count').active = true
          await PromiseUtils.wait(bubbleTime * 2000);
          npc.getChildByName('count').active = false
          npc.getChildByName("bubble").active = false;
          const startTile = this._getTilePos(
            new Vec2(npc.getPosition().x, npc.getPosition().y)
          );
          const finishTile = this._getTilePos(
            new Vec2(
              npc.getPosition().x + adaptX * 32,
              npc.getPosition().y + adaptY * 32
            )
          );
          npc
            .getChildByName("NPCinstantiate")
            .getComponent(NPCControl)
            .aStartMove(
              new Vec2(startTile.x, startTile.y),
              new Vec2(finishTile.x, finishTile.y),
              () => {
                npc
                  .getChildByName("NPCinstantiate")
                  .getComponent(NPCControl)
                  .setNPCMoveDirect(KeyCode.KEY_A);
              }
            );
    
          fieldIndexX = fieldIndexX + 1;
          if(fieldIndexX >= 9){
            // let json = new network.NpcActionDone();
            // json.command = 10008;
            // json.type = 1;
            // json.data.bid = actionData.bid
            // json.data.npcId = actionData.npcId
            // json.data.objId = actionData.params.oid
            // socket.sendWebSocketBinary(json);
          }
          await PromiseUtils.wait(bubbleTime * 2000);
        }

        item.removeFromParent()
        this[`info_${actionData.params.oid}`].fieldNode = null
      }

    //!牧民喂养
    async butcherFeeding(npc: Node, actionData: DataEvents){
      const img = 'action/bubble/farm/wheat'
      WebUtils.getResouceImg(
        img,
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      npc.getChildByName('count').getComponent(Label).string = `-${actionData.params.count}`
      npc.getChildByName('count').active = true
      await PromiseUtils.wait(bubbleTime * 2000);
      npc.getChildByName('count').active = false


      WebUtils.getResouceImg(
        BubbleImgUrl.clean,
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      //npc.getChildByName('count').active = true
      await PromiseUtils.wait(bubbleTime * 2000);
      //npc.getChildByName('count').active = false

      npc.getChildByName("bubble").active = false;
      
    }

    async butcherSkill(npc: Node, actionData: DataEvents){
      const img = 'action/bubble/farm/wheat'
      WebUtils.getResouceImg(
        BubbleImgUrl.knife,
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      await PromiseUtils.wait(bubbleTime * 2000);

      WebUtils.getResouceImg(
        'action/bubble/cook/hock',
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      npc.getChildByName('count').active = true
      npc.getChildByName('count').getComponent(Label).string = `+${actionData.params.count}`
      await PromiseUtils.wait(bubbleTime * 2000);
      npc.getChildByName('count').active = false
      npc.getChildByName("bubble").active = false;
    }

    async breadMake(npc: Node, actionData: DataEvents){
      const img = 'action/bubble/farm/wheat'
      WebUtils.getResouceImg(
        'action/bubble/farm/wheat',
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      npc.getChildByName('count').getComponent(Label).string = `-${actionData.params.items[0].count}`
      npc.getChildByName('count').active = true
      await PromiseUtils.wait(bubbleTime * 2000);
      npc.getChildByName('count').active = false

      WebUtils.getResouceImg(
        'action/bubble/cook/bread',
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      npc.getChildByName('count').getComponent(Label).string = `+${actionData.params.items[0].count}`
      npc.getChildByName('count').active = true
      await PromiseUtils.wait(bubbleTime * 2000);
      npc.getChildByName('count').active = false
      npc.getChildByName("bubble").active = false;
    }

    //售货员
    async sale(npc: Node, actionData: DataEvents){
      const item = _.find(ProductsItemUrl.ItemCfg, (item) => {
        return item.id === actionData.params.itemId;
      });
      WebUtils.getResouceImg(
        item.url,
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      npc.getChildByName('count').getComponent(Label).string = `-${actionData.params.count}`
      npc.getChildByName('count').active = true
      await PromiseUtils.wait(bubbleTime * 2000);
      npc.getChildByName('count').active = false

      WebUtils.getResouceImg(
        'action/bubble/sale/money',
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );

      npc.getChildByName('count').getComponent(Label).string = `+${actionData.params.count * actionData.params.price}`
      npc.getChildByName('count').active = true
      await PromiseUtils.wait(bubbleTime * 2000);
      npc.getChildByName('count').active = false
      npc.getChildByName("bubble").active = false;
    }

    async buy(npc: Node, actionData: DataEvents){
      const item = _.find(ProductsItemUrl.ItemCfg, (item) => {
        return item.id === actionData.params.itemId;
      });
      WebUtils.getResouceImg(
        'action/bubble/sale/money',
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      npc.getChildByName('count').getComponent(Label).string = `-${actionData.params.count * actionData.params.price}`
      npc.getChildByName('count').active = true
      await PromiseUtils.wait(bubbleTime * 2000);
      npc.getChildByName('count').active = false

      WebUtils.getResouceImg(
        item.url,
        npc.getChildByName("bubble"),
        () => {
          npc.getChildByName("bubble").active = true;
        }
      );
      npc.getChildByName('count').getComponent(Label).string = `+${actionData.params.count}`
      npc.getChildByName('count').active = true
      await PromiseUtils.wait(bubbleTime * 2000);
      npc.getChildByName('count').active = false
      npc.getChildByName("bubble").active = false;
    }

    speak(npc, actionData){
      npc.getChildByName('speakContent').getComponent(Label).string = actionData.params.content
      npc.getChildByName('speakContent').active = true
    }

  stopFarming(npc: Node, cb?: () => void) {
    npc.getChildByName("bubble").active = false;
  }

  //?接收行为数据
  async playNPCAction(actions: any) {
    //!先移动到位置
    const actionData : DataEvents= actions.data.data
    const npc = _.find(this.otherNPCarr, (item) => {
      return (
        item.getChildByName("NPCinstantiate").getComponent(NPCControl).NpcID ===
        actionData.npcId
      );
    });
    let eventPox
    let finishTile

    const startTile = this._getTilePos(
      new Vec2(npc.getPosition().x, npc.getPosition().y)
    );
    try {
          
      if(actionData.actionId === NpcEventType.speak){
        const toNpc = _.find(this.otherNPCarr, (item) => {
          return (
            item.getChildByName("NPCinstantiate").getComponent(NPCControl).NpcID ===
            actionData.params.npcId
          );
        });
        const toPos = this._getTilePos(
          new Vec2(toNpc.getPosition().x, toNpc.getPosition().y)
        );
        eventPox = toNpc.getPosition()
        finishTile = toPos;
      }else{
        finishTile =  this._getTilePos(new Vec2(eventPox.x, eventPox.y));
      }

  } catch (error) {
      
  }
    
    let cb: any;

    //!然后出发事件气泡
    if (actionData.actionId === NpcEventType.sleep) {
      cb = () => {
        const nodes = this.getSleepNode(actionData.npcId);
        this.setNpcDirect(npc, actionData, "sleepHeadDirect");
        this.npcSleep(npc, nodes.head, nodes.bubble, async () => {
          npc.getChildByName("bubble").active = false;
          npc.active = false;
          const shouldSend = await this.checkPlayerId(actionData)
          if(!shouldSend){
            return
          }
          let json = new network.NpcActionDone();
          json.command = 10008;
          json.type = 1;
          json.data.bid = actionData.bid
          json.data.npcId = actionData.npcId
          json.data.objId = actionData.params.oid
          json.data.x = eventPox.x
          json.data.y = hight - eventPox.y
          json.data.isFinish = 1 
          json.data.state = 1 
          json.data.params = {
            oid: actionData.params.oid
          }
          socket.sendWebSocketBinary(json);
        });
      };
    } else if (actionData.actionId === NpcEventType.cook) {
      cb = async () => {
        this.setNpcDirect(npc, actionData, "cookHeadDirect");
        await this.npcCook(npc, actionData);
      };
    } else if (actionData.actionId === NpcEventType.dinning) {
      cb = async () => {
        this.setNpcDirect(npc, actionData, "diningHeadDirect");
        await this.npcDinning(npc, actionData);
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        json.data.params = {
          oid: actionData.params.oid,
          itemId: actionData.params.itemId,
          count: 1,
        }
        socket.sendWebSocketBinary(json);
      };
    } else if (actionData.actionId === NpcEventType.farming) {
      cb = async () => {

        npc
          .getChildByName("NPCinstantiate")
          .getComponent(NPCControl)
          .setNPCMoveDirect(KeyCode.KEY_A);
        await PromiseUtils.wait(bubbleTime * 2000);
        await this.npcFarming(npc, actionData);
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        json.data.params = {
          oid: actionData.params.oid,
          itemId: actionData.params.itemId,
          count: 9,
        }
        socket.sendWebSocketBinary(json);
      };
    } else if (actionData.actionId === NpcEventType.harvest){
        cb = async () => {
            npc
            .getChildByName("NPCinstantiate")
            .getComponent(NPCControl)
            .setNPCMoveDirect(KeyCode.KEY_A);
            await PromiseUtils.wait(bubbleTime * 2000);
            await this.npcHarvest(npc,actionData)
            const shouldSend = await this.checkPlayerId(actionData)
            if(!shouldSend){
              return
            }
            let json = new network.NpcActionDone();
            json.command = 10008;
            json.type = 1;
            json.data.bid = actionData.bid
            json.data.npcId = actionData.npcId
            json.data.objId = actionData.params.oid
            json.data.x = eventPox.x
            json.data.y = hight - eventPox.y
            json.data.isFinish = 1 
            json.data.state = 1 
            json.data.params = {
              oid: actionData.params.oid
            }
            socket.sendWebSocketBinary(json);
          };

    } else if (actionData.actionId === NpcEventType.getup){
        cb = async ()=>{
          const shouldSend = await this.checkPlayerId(actionData)
          if(!shouldSend){
            return
          }
            let json = new network.NpcActionDone();
            json.command = 10008;
            json.type = 1;
            json.data.bid = actionData.bid
            json.data.npcId = actionData.npcId
            json.data.objId = actionData.params.oid
            json.data.x = eventPox.x
            json.data.y = hight - eventPox.y
            json.data.isFinish = 1 
            json.data.state = 1 
            json.data.params = {
              oid: actionData.params.oid
            }
            socket.sendWebSocketBinary(json);
        }

    } else if(actionData.actionId === NpcEventType.move){
      cb = async () => {
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.npcId = actionData.npcId
        json.data.actionId = 112
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        json.data.bid = actionData.bid
        socket.sendWebSocketBinary(json);
      };
    } else if(actionData.actionId === NpcEventType.move){
      cb = async () => {
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.npcId = actionData.npcId
        json.data.actionId = 112
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        json.data.bid = actionData.bid
        socket.sendWebSocketBinary(json);
      };
    } else if(actionData.actionId === NpcEventType.speak){
      cb = async () => {
        this.speak(npc, actionData)
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();

        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        socket.sendWebSocketBinary(json);
      };
    } else if(actionData.actionId === NpcEventType.buy){
      cb = async () => {
        await this.buy(npc, actionData,)
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        socket.sendWebSocketBinary(json);
      };
    } else if(actionData.actionId === NpcEventType.sale){
      cb = async () => {
        await this.sale(npc, actionData,)
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        socket.sendWebSocketBinary(json);
      };
    } else if(actionData.actionId === NpcEventType.slaughter){
      cb = async () => {
        await this.butcherSkill(npc, actionData,)
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        socket.sendWebSocketBinary(json);
      };
    } else if(actionData.actionId === NpcEventType.make){
      cb = async () => {
        await this.breadMake(npc, actionData,)
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        socket.sendWebSocketBinary(json);
      };
    } else if(actionData.actionId === NpcEventType.feeding){
      cb = async () => {
        await this.butcherFeeding(npc, actionData,)
        const shouldSend = await this.checkPlayerId(actionData)
        if(!shouldSend){
          return
        }
        let json = new network.NpcActionDone();
        json.command = 10008;
        json.type = 1;
        json.data.bid = actionData.bid
        json.data.npcId = actionData.npcId
        json.data.objId = actionData.params.oid
        json.data.x = eventPox.x
        json.data.y = hight - eventPox.y
        json.data.isFinish = 1 
        json.data.state = 1 
        socket.sendWebSocketBinary(json);
      };
    }

    // if(startTile.x === finishTile.x && startTile.y === finishTile.y){
    //     return
    // }

      this.stopActionNormal(npc, actionData);
      npc
        .getChildByName("NPCinstantiate")
        .getComponent(NPCControl)
        .aStartMove(
          new Vec2(startTile.x, startTile.y),
          new Vec2(finishTile.x, finishTile.y),
          cb
        );
    

  }

  async setFieldReady(actionData: any) {
    
    const farmItem = _.find(ProductsItemUrl.ItemCfg, (item) => {
      return item.id === actionData.params.itemId;
    })

    const item = instantiate(this[farmItem.fieldName]) as Node;
    item.setParent(this[actionData.params.oid])
    this[`info_${actionData.params.oid}`].fieldNode = item
    item.setPosition(new Vec3(0,0,0))
    const fieldArr: Node[] = [...item.children]
    if(!fieldArr){
      return
    }
    let fieldIndexX = 1;
    let adaptX;
    let adaptY;
    for (const field of fieldArr) {
        field.active = true
        await PromiseUtils.wait(bubbleTime * 2000);
        field.getChildByName('farm_wheat_l').active = true
    }
  }

  setNpcDirect(npc: Node, actionData: DataEvents, directType: string) {
    const direct = EventNpcInfoMap[actionData.npcId][directType];
    npc
      .getChildByName("NPCinstantiate")
      .getComponent(NPCControl)
      .setNPCMoveDirect(direct);
  }

  //?完成行为
  finishNPCAction(farmAction: DataFarmEvent) {}

  initPlayerNPC(myNPC: NPCServerD) {
    this._curPlayerTile = this._getTilePos(new Vec2(9, 11));
    //this.player.parent.getComponent(NPCControl).NpcID = myNPC.id;
    this.player.parent.getComponent(NPCControl)._curTile = new Vec2(9, 11);
    const pos = this._layerFloor.getPositionAt(this._curPlayerTile)!;
    this.player.parent.parent.setPosition(300, 1000);
    if (this.player.parent.getComponent(NPCControl).camera) {
      const gameView = view.getVisibleSize();
      let mainCamera = this.player.parent.getComponent(NPCControl).camera.node;
      mainCamera.setPosition(pos.x, pos.y);

      // if (pos.x < gameView.x) {
      //   mainCamera.setPosition(gameView.x, mainCamera.getPosition().y);
      // } else if (pos.x > hight - gameView.x) {
      //   mainCamera.setPosition(hight - gameView.x, mainCamera.getPosition().y);
      // } else {
      //   mainCamera.setPosition(pos.x, mainCamera.getPosition().y);
      // }
      // if (pos.y < gameView.y) {
      //   mainCamera.setPosition(mainCamera.getPosition().x, gameView.y);
      // } else if (pos.y > hight - gameView.y) {
      //   mainCamera.setPosition(mainCamera.getPosition().x, hight - gameView.y);
      // } else {
      //   mainCamera.setPosition(mainCamera.getPosition().x, pos.y);
      // }
    }
    //this.player.parent.getComponent(NPCControl).camera.node.setPosition(myNPC.x, myNPC.y)
    // 使用函数获取标签为 'hair'，id 为 100 的对象信息
    //const hairPartInfo = getPartInfo('hair', myNPC.hair);
    // WebUtils.getResouceImg(
    //   this.getPartInfo("hair", myNPC.hair).frame_path,
    //   this.player.getChildByName("hair")
    // );
    // WebUtils.getResouceImg(
    //   this.getPartInfo("shirt", myNPC.top).frame_path,
    //   this.player.getChildByName("shirt")
    // );
    // WebUtils.getResouceImg(
    //   this.getPartInfo("pants", myNPC.bottoms).frame_path,
    //   this.player.getChildByName("pants")
    // );
    this.loading.active = false;
  }

  initOtherNPCs(myNPC: NPCServerD[]) {
    myNPC.forEach((NPC: NPCServerD) => {
      this.initOtherNPC(NPC);
    });
  }

  initOtherNPC(NPC: NPCServerD) {
    let item = instantiate(this.playerInstantiate) as Node;
    item.active = true;
    this.playerLayer.addChild(item);
    //this.tiledLayer.addUserNode(item)
    item.getChildByName("NPCinstantiate").getComponent(NPCControl).NpcID =
      NPC.id;
    this.otherNPCarr.push(item);
    let npcTile = new Vec2();
    const isValueIncluded = _.includes([10002, 10003, 10004, 10005], NPC.id);
    if (isValueIncluded) {
      npcTile = this._getTilePos(
        new Vec2(NPC.x * PosAdapt, hight - NPC.y * PosAdapt)
      );
    }
    const pos = this._layerFloor.getPositionAt(npcTile)!;
    this._npcTileArray.push(npcTile);
    item.getChildByName("NPCinstantiate").getComponent(NPCControl)._curTile =
      npcTile;
    item.setPosition(pos.x, pos.y);
    item.getChildByName("NPCinstantiate").getComponent(NPCControl).npcIndex =
    NpcIndex[NPC.id];
    this.scheduleOnce(() => {
      WebUtils.getResouceImg(
        this.getPartInfo("body", NPC.model)?.frame_path,
        item
          .getChildByName("NPCinstantiate")
          .getChildByName("npc_root")
          .getChildByName("body")
      );
      WebUtils.getResouceImg(
        "",
        item
          .getChildByName("NPCinstantiate")
          .getChildByName("npc_root")
          .getChildByName("hair")
      );
      WebUtils.getResouceImg(
        "",
        item
          .getChildByName("NPCinstantiate")
          .getChildByName("npc_root")
          .getChildByName("shirt")
      );
      WebUtils.getResouceImg(
        "",
        item
          .getChildByName("NPCinstantiate")
          .getChildByName("npc_root")
          .getChildByName("pants")
      );
      if (NPC.model <= 10001) {
        this.getPartInfo("hair", NPC.hair)?.frame_path &&
          WebUtils.getResouceImg(
            this.getPartInfo("hair", NPC.hair)?.frame_path,
            item
              .getChildByName("NPCinstantiate")
              .getChildByName("npc_root")
              .getChildByName("hair")
          );
        this.getPartInfo("shirt", NPC.top)?.frame_path &&
          WebUtils.getResouceImg(
            this.getPartInfo("shirt", NPC.top)?.frame_path,
            item
              .getChildByName("NPCinstantiate")
              .getChildByName("npc_root")
              .getChildByName("shirt")
          );
        this.getPartInfo("pants", NPC.bottoms)?.frame_path &&
          WebUtils.getResouceImg(
            this.getPartInfo("pants", NPC.bottoms)?.frame_path,
            item
              .getChildByName("NPCinstantiate")
              .getChildByName("npc_root")
              .getChildByName("pants")
          );
      }
    }, 0);
  }

  initOtherNPCByData(data: any) {
    this.initOtherNPC(data.data.myNpc);
  }

  removeNPC(data: any) {
    const offLineNPC = _.find(
      this.otherNPCarr,
      (item) => item?.getComponent(NPCControl)?.NpcID === data?.data?.npcIds[0]
    );
    offLineNPC?.removeFromParent();
    this.otherNPCarr = _.remove(
      this.otherNPCarr,
      (item) => item?.getComponent(NPCControl)?.NpcID !== data?.data?.npcIds[0]
    );
  }

  updateOtherPlayerInfo(data: any) {
    if (this.player.parent.getComponent(NPCControl).NpcID === data.data.npcId) {
      return;
    }
    const moveNPC = _.find(
      this.otherNPCarr,
      (item) =>
        item.getChildByName("NPCinstantiate").getComponent(NPCControl).NpcID ===
        data.data.npcId
    );
    let steepKey: KeyCode;
    if (data.data.x > moveNPC.getPosition().x) {
      steepKey = KeyCode.KEY_D;
    }
    if (data.data.x < moveNPC.getPosition().x) {
      steepKey = KeyCode.KEY_A;
    }
    if (data.data.y < moveNPC.getPosition().y) {
      steepKey = KeyCode.KEY_S;
    }
    if (data.data.y > moveNPC.getPosition().y) {
      steepKey = KeyCode.KEY_W;
    }
    moveNPC
      .getChildByName("NPCinstantiate")
      .getComponent(NPCControl)
      .setNPCMoveDirect(steepKey);

    moveNPC
      .getChildByName("NPCinstantiate")
      .getComponent(NPCControl)
      .setMoveSprite(steepKey);
    moveNPC
      .getChildByName("NPCinstantiate")
      .getComponent(NPCControl)
      .setNPCPosition(steepKey);
    tween(moveNPC)
      .to(
        0.05,
        { position: new Vec3(data.data.x, data.data.y, 0) },
        {
          onComplete: () => {
            //this.ClientPlayerMoveCallBack(tilePos, pid);
            // let json = new network.NpcActionDone();
            // json.command = 10008;
            // json.type = 1;
            // json.data.actionId = 112
            // json.data.npcId = data.data.npcId
            // json.data.x = moveNPC.getPosition().x
            // json.data.y = hight - moveNPC.getPosition().y
            // json.data.isFinish = 1 
            // json.data.state = 1 
            // socket.sendWebSocketBinary(json);
          },
        }
      )
      .start();
  }

  _getTilePos(posInPixel: { x: number; y: number }) {
    const mapSize = this.node.getComponent(UITransform).contentSize;
    const tileSize = this.getComponent(TiledMap).getTileSize();
    const x = Math.floor(posInPixel.x / tileSize.width);
    const y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
    return new Vec2(x, y - 1);
  }

  protected onDestroy(): void {
    observer.off(EventType.SOCKET_GETALL_NPCS, this.setNPCPos, this);
    // observer.off(EventType.SOCKET_ONLINE_NPCS, this.initOtherNPC, this)
    // observer.off(EventType.SOCKET_OFFLINE_NPCS, this.removeNPC, this)
  }

  async testFarmRound(){
    // await PromiseUtils.wait(bubbleTime * 1000);
    // window.farmcook()
    // await PromiseUtils.wait(bubbleTime * 20000);
    // window.farmeat()
    // await PromiseUtils.wait(bubbleTime * 10000);
    // window.farm()
    // await PromiseUtils.wait(bubbleTime * 80000);
    // window.farmGoSleep()
    // await PromiseUtils.wait(bubbleTime * 80000);
    // window.fieldReady()
    // await PromiseUtils.wait(bubbleTime * 10000);
    // window.farmHarvest()
    // await PromiseUtils.wait(bubbleTime * 80000);
    // this.testFrameIndex = 0
  }

  async testBakerRound(){
    // await PromiseUtils.wait(bubbleTime * 1000);
    // window.bakerCook()
    // await PromiseUtils.wait(bubbleTime * 60000);
    // window.bakerDinning()
    // await PromiseUtils.wait(bubbleTime * 10000);
    // window.bakerSleep()
    // await PromiseUtils.wait(bubbleTime * 40000);
    // this.testbakerIndex = 0
  }

  async updateObjectStateChange(data){
    data?.data && data.data.forEach(async (object)=>{
      if(object.objId === 'farmland1' || object.objId === 'farmland2' || object.objId === 'farmland3' || object.objId === 'farmland4'){
        if(object.state === '2'){
          await this.setFieldReady({
            params:{
              oid: object.objId,
              itemId: object.params.itemId
            }

          })
        }
      }
    })

  }

  async objectStateChange(data){
    if(data.data.oid === 'farmland1' || data.data.oid === 'farmland3' || data.data.oid === 'farmland4'){
      if(data.data.state === '2'){
        await this.setFieldReady({
          params:{
            oid: data.oid,
            itemId: data.params.itemId
          }
        })
      }

    }
  }

  async update(deltaTime: number) {
    this.sleepFrameAdd = this.sleepFrameAdd + deltaTime;
    if (this.sleepFrameAdd > sleepFrameTime) {
      this.setNpcHomeBed(this.homeBedFrameIndex);
      this.homeBedFrameIndex = ++this.homeBedFrameIndex > 1 ? 0 : 1;
      this.sleepFrameAdd = 0;
    }

    if(this.testbakerIndex === 0){
        this.testbakerIndex = this.testbakerIndex + deltaTime
        this.testBakerRound()
    }
    if(this.testFrameIndex === 0){
        this.testFrameIndex = this.testFrameIndex + deltaTime
        await this.testFarmRound()
    }


  }
}
