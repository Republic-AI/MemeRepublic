import { assetManager, ImageAsset, sp, Texture2D, Node } from "cc";
import Log from "./LogUtils";

const TAG = 'loadRemoteSpineRes'
export function loadRemoteSpineRes(atlas: string, ske: string, image: string, ske_component: sp.Skeleton, cat: Node = null, call_back: ()=> void){
    assetManager.loadAny([{ url: atlas, ext: '.txt' }, { url: ske, ext: '.txt' }], (error, assets) => {
        assetManager.loadRemote(image, (error, spine_texture: ImageAsset) => {
            try {
                let asset = new sp.SkeletonData();
                asset.skeletonJson = JSON.parse(assets[1]);
                asset.atlasText = assets[0];
                let texture = new Texture2D();
                texture.image = spine_texture;
                asset.textures = [texture];
                asset.textureNames = ['cc.png'];
                asset._uuid = ske; // 可以传入任意字符串，但不能为空
                ske_component.skeletonData = asset;
                cat && (cat.active = false)
                call_back()
            } catch (error) {
                Log.log(TAG, error)
            }

            //this.playSpineAnimation('idle')
        });
    });
}
