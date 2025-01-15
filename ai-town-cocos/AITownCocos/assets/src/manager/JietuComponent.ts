import { _decorator, Component, Node, Camera, RenderTexture, director, gfx, SpriteFrame, ImageAsset, Sprite, Texture2D, EventTouch, Vec3, Canvas } from 'cc';
import Log from '../../../assets/src/utils/LogUtils'

const { ccclass, property } = _decorator;

const postCardSize = { width: 750, height: 1334 }
const windowSize = { width: 750, height: 1334 }
export const upLoadPostcard = 'upLoadPostcard'

export function base64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
                    .replace(/\-/g, '+')
                    .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
}

const TAG = 'JietuComponent'
/**
 * 
 */
@ccclass('JietuComponent')
export class JietuComponent extends Component {
    @property(Camera)
    camera: Camera = null;
    @property(Canvas)
    canvas: Canvas = null;
    @property(Sprite)
    base64HeadSpr: Sprite = null;


    base64Head;
    protected _renderTex: RenderTexture = new RenderTexture();

    start() {
        this._renderTex.reset({ width: 750, height: 1334 });
        this.base64HeadSpr.node.on(Node.EventType.TOUCH_START, this.touchStartHandler, this);
        this.base64HeadSpr.node.on(Node.EventType.TOUCH_MOVE, this.touchMOveHandler, this);
        this.base64HeadSpr.node.on(Node.EventType.TOUCH_END, this.touchendHandler, this);
    }

    update(deltaTime: number) {

    }
    /** */
    clickCaptureHandler() {
        this.capture(windowSize, "chatLogImage");
    }

    /**生成明信片分享到TG */
    createPostcard(){
        this.capture(postCardSize, 'postcard');
    }

    /**
     * 将camera 绘制的内容渲染到 指定的 rendertexture,对应的canvas内容将失效,不再更新新的数据;
     * @returns 
     */
    capture(size: {width: number, height: number}, path: string): string {
        (window as any).global = window
        let camera = this.camera;
        camera.targetTexture = this._renderTex;
        this.scheduleOnce(() => {
            //this._renderTex.reset(size)
            this.base64Head = this.copyRenderTex(this._renderTex);
            camera.targetTexture = null;
            const generateUniqueId = `id_${Date.now().toString(36)}`;
            let temp = this.base64Head.split("data:image/jpeg;base64,")[1];

            //this.node.emit(message,"data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAoCAYAAAD6xArmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7VdNaxNBGH5md0sJ2mpLNUlT6qEq1KpEhGpJPVSaglUPbcAcRKxSvHgSPBXBX6BnUfCmEBDFqycPildBFPET+pE2pR9pWhLytduZKZvukm1mpjSXkgeWeWfmnWfeeebdN1lSnP9ioQ7QUCc0iBvEisRff/xGcyiCpuAAfxLvPkAWRPSCMPIL0QmYpglN05Cf+wwZCKUInzqBxw8nuc3I+wbjkIGUxlMP7qDT38HtX3+n+Sn2hJjh/eunFfvmvUdCf2liJonP18ztP/9nhf5K6Xa29zhvmdYiOZSIT/f2VOxnL9/U9CWq9ZjlM8PJnm58/5TY0W+f1wrnhbUdasGeETsvbHQ4UtNX6fKOha8jmVriNl1X01cp4vnFZd4eFsigRDx4dRKWtXW42LUhob+UFOzS+odvc2L2Wmf+fRQtkYs4On6/Eu2LJ1MyS8TErP6m19a5PRqNID42AhkYtSaZBJcuhvnTHQrwuiwLUq//bkbq28+tHejvmUXLIdOSEFLRlM/RvhO2j6+9DQcCHdB1vYqYvB27TBnYwp0Cd85t2yyQluBRnJu4gdaQvzriUr6A3YBtkVvNoFzIe84b4Vvj2z2TRqO5j+0ac9hE03HQf4RGG/Am1rs6oekEZtlytS5uxxztYXU5jQ2agu25LFrpiO5FnHj+CiowyyZy2SxvjSYDsbtx9J0/U028ns5AFXbGFAtFLMwkvYlHYldc6WWnFuvbaeUcLxVLWEymsLaShr8riP6hAc/NSePjxsYmos7ZM/x85v8AAAAASUVORK5CYII=");

           
        }, 1)
        return "";
    }



    /**
     * 将rendertexture 中的内容复制出来
     * @param renderTex 
     * @returns 
     */
    copyRenderTex(renderTex: RenderTexture): string {

        let arrayBuffer = new ArrayBuffer(renderTex.width * renderTex.height * 4);
        let region = new gfx.BufferTextureCopy();
        region.texOffset.x = 0;
        region.texOffset.y = 0;
        region.texExtent.width = renderTex.width;
        region.texExtent.height = renderTex.height;
        let dataview = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength);
        // console.log(dataview);[0,0,0,0,0,0,0,0,0,0,0,,,]
        //获取到纹理数据
        director.root.device.copyTextureToBuffers(renderTex.getGFXTexture(), [dataview], [region]);
        // director.root.device.copyFramebufferToBuffer(renderTex.window.framebuffer, arrayBuffer, [region]);
        // console.log(dataview);[0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,,,,]

        return this.toB64(dataview.buffer);
    }

    /**
     * 通过htmlcanvas ,将纹理缓冲绘制到canvas,
     * 将canvas 上图片转换为base64 数据;
     * @param arrayBuffer 
     * @returns 
     */
    toB64(arrayBuffer: ArrayBuffer): string {
        let canvas = document.createElement('canvas');
        let width = canvas.width = Math.floor(750);
        let height = canvas.height = Math.floor(1334);
        let ctx = canvas.getContext('2d');
        let imageU8Data = new Uint8Array(arrayBuffer);
        let rowBytes = width * 4;
        let rowBytesh = height * 4;
        for (let row = 0; row < rowBytesh; row++) {
            let sRow = height - 1 - row;
            let imageData = ctx.createImageData(width, 1);
            let start = sRow * rowBytes;
            for (let i = 0; i < rowBytes; i++) {
                imageData.data[i] = imageU8Data[start + i];
            }
            ctx.putImageData(imageData, 0, row);
        }
        var base64 = canvas.toDataURL("image/jpeg", 0.1); //压缩语句
        try {
            localStorage.setItem('base64Head', base64)
        } catch (error) {

        }
        // console.log('base64', base64)
        return base64;

    }


    public copybase64toSprite(evt) {
        let img = new Image();
        let texture = new Texture2D();
        img.src = this.base64Head;
        img.onload = () => {
            texture.image = new ImageAsset(img);
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            this.base64HeadSpr.getComponent(Sprite).spriteFrame = spriteFrame;
            this.scheduleOnce(() => {
                Log.log(TAG,this.base64HeadSpr)
            },)
        }
    }
    public canmove: boolean = false;
    public touchStartHandler(Tevt) {
        this.canmove = true;
    }

    public touchMOveHandler(Tevt: EventTouch) {
        let loca = Tevt.getLocation();
        if (this.canmove) {
            // this.base64HeadSpr.node.position = new Vec3(loca.x,loca.y);
            this.base64HeadSpr.node.worldPosition = new Vec3(loca.x, loca.y);
        }
    }
    touchendHandler(evt) {
        this.canmove = false;
    }

}


