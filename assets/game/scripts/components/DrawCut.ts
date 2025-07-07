import { _decorator, Component, Node, Graphics, Vec2, Vec3, EventTouch, UITransform, Camera, Canvas, RenderTexture, Sprite, SpriteFrame, Size, CCInteger } from 'cc';
import { DealWithPixelLine } from './DealWithPixelLine';
const { ccclass, property } = _decorator;

@ccclass('DrawCut')
export class DrawCut extends Component {
    @property(Camera)
    camera: Camera = null!;

    @property(Sprite)
    drawingSprite: Sprite = null!;

    @property(CCInteger)
    height: number = 0;

    @property(CCInteger) 
    width: number = 0;

    @property(Node)
    gestureNode: Node = null!;

    private graphics: Graphics = null;

    private renderTexture: RenderTexture = null!;

    private isDrawing: boolean = false;
    private drawPoints: Vec2[] = [];
    private lineWidth: number = 5;
    private lineColor: string = '#00FF00';

    start() {
        const uit = this.node.getComponent(UITransform);
        uit.setContentSize(this.width, this.height);

        const gestureUit = this.gestureNode.getComponent(UITransform);
        gestureUit.setContentSize(this.width, this.height);

        this.initRenderTexture();
        this.initGraphics();
    }

    private initRenderTexture() {
        const spriteframe = this.drawingSprite.spriteFrame;
        const sp = new SpriteFrame();
        sp.reset({
            originalSize: spriteframe.getOriginalSize(),
            rect: spriteframe.getRect(),
            offset: spriteframe.getOffset(),
            isRotate: spriteframe.isRotated(),
            borderTop: spriteframe.insetTop,
            borderLeft: spriteframe.insetLeft,
            borderBottom: spriteframe.insetBottom,
            borderRight: spriteframe.insetRight,
        });

        const renderTex = this.renderTexture = new RenderTexture();
        // 获取屏幕宽高

        renderTex.reset({
            width: this.width,
            height: this.height,
            // colorFormat: RenderTexture.PixelFormat.RGBA8888,
            // depthStencilFormat: RenderTexture.DepthStencilFormat.DEPTH_24_STENCIL_8
        });
        this.camera.targetTexture = renderTex;
        sp.texture = renderTex;
        this.drawingSprite.spriteFrame = sp;
        const drawUit = this.drawingSprite.node.getComponent(UITransform);
        drawUit.setContentSize(this.width, this.height);
    }

    private initGraphics() {
        // If graphics component is not assigned, try to get it from the same node
        if (!this.graphics) {
            this.graphics = this.getComponent(Graphics);
            if (!this.graphics) {
                this.graphics = this.addComponent(Graphics);
            }
        }

        // Set graphics properties
        this.graphics.lineWidth = this.lineWidth;
        this.graphics.strokeColor.fromHEX(this.lineColor);
        this.graphics.lineCap = Graphics.LineCap.ROUND;
        this.graphics.lineJoin = Graphics.LineJoin.ROUND;
    }


    public onTouchStart(worldPos: Vec2) {
        console.log('onTouchStart');
        this.isDrawing = true;
        this.drawPoints = [];
        
        this.drawPoints.push(worldPos);
        // Start drawing
        this.graphics.moveTo(worldPos.x, worldPos.y);
    }

    public onTouchMove(worldPos: Vec2) {
        if (!this.isDrawing) return;

        // console.log('onTouchMove');

        if (this.checkNewLineIntersection(worldPos)) {
            console.log('intersect');
        }

        this.drawPoints.push(worldPos);
        
        // Continue drawing line
        this.graphics.lineTo(worldPos.x, worldPos.y);
        this.graphics.stroke();
    }

    public onTouchEnd(worldPos: Vec2) {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        
        // Optional: Add final point if needed
        this.drawPoints.push(worldPos);
        
        // Complete the line
        this.graphics.lineTo(worldPos.x, worldPos.y);
        this.graphics.stroke();
    }


    // Clear all drawings
    public clearDrawings() {
        this.graphics.clear();
        this.drawPoints = [];
    }

    // Set line properties
    public setLineProperties(width: number, color: string) {
        this.lineWidth = width;
        this.lineColor = color;
        this.graphics.lineWidth = width;
        this.graphics.strokeColor.fromHEX(color);
    }

    // Get the drawn points (useful for other systems)
    public getDrawPoints(): Vec2[] {
        return [...this.drawPoints];
    }

    update(deltaTime: number) {
        // Update logic if needed
    }

    onDestroy() {
        // Clean up event listeners
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    checkLineIntersection(p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2): boolean {
        // 计算方向
        const uA = ((p4.x-p3.x)*(p1.y-p3.y) - (p4.y-p3.y)*(p1.x-p3.x)) / 
                   ((p4.y-p3.y)*(p2.x-p1.x) - (p4.x-p3.x)*(p2.y-p1.y));
        const uB = ((p2.x-p1.x)*(p1.y-p3.y) - (p2.y-p1.y)*(p1.x-p3.x)) / 
                   ((p4.y-p3.y)*(p2.x-p1.x) - (p4.x-p3.x)*(p2.y-p1.y));
    
        // 如果uA和uB在0-1之间，则线段相交
        return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
    }

    checkNewLineIntersection(newPos: Vec2): boolean {
        if (this.drawPoints.length < 2) {
            return false;
        }
        const lastPos = this.drawPoints[this.drawPoints.length - 1];
        for (let i = 0; i < this.drawPoints.length - 1; i++) {
            const isIntersect = this.checkLineIntersection(lastPos, newPos, this.drawPoints[i], this.drawPoints[i + 1]);
            if (isIntersect) {
                return true;
            }
        }
        return false;
    }
    
    gmBig() {
        const curScale = this.drawingSprite.node.scale;
        this.drawingSprite.node.scale = new Vec3(curScale.x * 2, curScale.y * 2, 1);
    }

    gmSmall() {
        const curScale = this.drawingSprite.node.scale;
        this.drawingSprite.node.scale = new Vec3(curScale.x / 2, curScale.y / 2, 1);
    }

    gmCapture() {
        const renderTex = this.renderTexture;
        const dealWithPixelLine = this.node.getComponent(DealWithPixelLine);
        dealWithPixelLine.dealWithPixelLine(renderTex);
    }
}

