import { _decorator, Component, director, gfx, Node, Sprite, Texture2D } from 'cc';
import { captureImage } from '../common/adaptor';
const { ccclass, property } = _decorator;

@ccclass('SpriteFramePixel')
export class SpriteFramePixel extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }


 
    public readPixels (texture: Texture2D, x = 0, y = 0, width?: number, height?: number) : Uint8Array | null {
        width = width || texture.width;
        height = width || texture.height;
        const gfxTexture = texture.getGFXTexture();
        if (!gfxTexture) {
            return null;
        }
        const bufferViews: ArrayBufferView[] = [];
        const regions: gfx.BufferTextureCopy[] = [];
    
        const region0 = new gfx.BufferTextureCopy();
        region0.texOffset.x = x;
        region0.texOffset.y = y;
        region0.texExtent.width = width;
        region0.texExtent.height = height;
        regions.push(region0);
    
        const buffer = new Uint8Array(width * height * 4);
        bufferViews.push(buffer);
    
        director.root?.device.copyTextureToBuffers(gfxTexture, bufferViews, regions)
    
        return buffer;
    }

    public gmCapSelf() {
        const sprite = this.node.getComponent(Sprite);
        const spriteFrame = sprite.spriteFrame;

        const pixels = this.readPixels(spriteFrame.texture as Texture2D, 0, 0, spriteFrame.width, spriteFrame.height);
        console.log('pixels width', spriteFrame.width);
        console.log('pixels height', spriteFrame.height);
        captureImage(pixels, spriteFrame.width, spriteFrame.height);
    }

}

