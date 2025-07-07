import { _decorator, Component, director, gfx, Node, Sprite, Texture2D } from 'cc';
import { captureImage } from '../common/adaptor';
const { ccclass, property } = _decorator;

@ccclass('SpriteFramePixel')
export class SpriteFramePixel extends Component {
    texWidth: number = 0;
    texHeight: number = 0;
    
    start() {

    }

    update(deltaTime: number) {
        
    }


 
    public readPixels (x = 0, y = 0) : Uint8Array | null {
        const sprite = this.node.getComponent(Sprite);
        const spriteFrame = sprite.spriteFrame;
        const texture = spriteFrame.getGFXTexture();
        this.texWidth = texture.width;
        this.texHeight = texture.height;
        const bufferViews: ArrayBufferView[] = [];
        const regions: gfx.BufferTextureCopy[] = [];
    
        const region0 = new gfx.BufferTextureCopy();
        region0.texOffset.x = x;
        region0.texOffset.y = y;
        region0.texExtent.width = this.texWidth;
        region0.texExtent.height = this.texHeight;
        regions.push(region0);
    
        const buffer = new Uint8Array(this.texWidth * this.texHeight * 4);
        bufferViews.push(buffer);
    
        director.root?.device.copyTextureToBuffers(texture, bufferViews, regions)
    
        return buffer;
    }

    public gmCapSelf() {
        const buffer = this.readPixels(0, 0);
        captureImage(buffer, this.texWidth, this.texHeight);
    }

    public hitTest(x: number, y: number) {
        const buffer = this.readPixels(0, 0);
        if (x >= 0 && x < this.texWidth && y >= 0 && y < this.texHeight) {
            const idx = (y * this.texWidth + x) * 4;
            const r = buffer[idx];
            const g = buffer[idx + 1];
            const b = buffer[idx + 2];
            const a = buffer[idx + 3];
            console.log('r', r, 'g', g, 'b', b, 'a', a);
            return r > 0 || g > 0 || b > 0 || a > 0;
        }
        return false;
    }

}

