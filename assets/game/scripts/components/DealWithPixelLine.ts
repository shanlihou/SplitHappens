import { _decorator, Color, Component, Node, RenderTexture, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DealWithPixelLine')
export class DealWithPixelLine extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    dealWithPixelLine(renderTexture: RenderTexture) {
        const width = renderTexture.width;
        const height = renderTexture.height;
        const pixels = new Uint8Array(width * height * 4);
        renderTexture.readPixels(0, 0, width, height, pixels);
    }
}


