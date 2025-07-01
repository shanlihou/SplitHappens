import { _decorator, Component, Node, Graphics, Vec2, Vec3, EventTouch, UITransform, Camera, Canvas, RenderTexture, Sprite, SpriteFrame, Size, CCInteger } from 'cc';
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

    private graphics: Graphics = null;

    private renderTexture: RenderTexture = null!;

    private isDrawing: boolean = false;
    private drawPoints: Vec2[] = [];
    private lineWidth: number = 5;
    private lineColor: string = '#FF0000';

    start() {
        this.initRenderTexture();
        this.initGraphics();
        this.setupTouchEvents();
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



        // this.renderTexture = new RenderTexture();
        // this.renderTexture.resize(this.width, this.height);
        
        // // 创建用于检测的Sprite
        // const sp = new SpriteFrame();
        // sp.texture = this.renderTexture;
        // this.drawingSprite.spriteFrame = sp;
        // const uit = this.drawingSprite.node.getComponent(UITransform);
        // uit.setContentSize(this.width, this.height);
        // this.drawingSprite.node.scale = new Vec3(0.5, 0.5, 1);
        // this.camera.targetTexture = this.renderTexture;
    }

    // 更新RenderTexture
    updateRenderTexture() {
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

    private setupTouchEvents() {
        // Add touch event listeners to the node
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        console.log('onTouchStart');
        this.isDrawing = true;
        this.drawPoints = [];
        
        const touchPos = event.getLocation();
        const worldPos = this.screenToWorld(touchPos);
        this.drawPoints.push(worldPos);

        console.log('touchPos', touchPos);
        console.log('worldPos', worldPos);
        
        // Start drawing
        this.graphics.moveTo(worldPos.x, worldPos.y);
    }

    private onTouchMove(event: EventTouch) {
        if (!this.isDrawing) return;

        // console.log('onTouchMove');

        const touchPos = event.getLocation();
        const worldPos = this.screenToWorld(touchPos);

        if (this.checkNewLineIntersection(worldPos)) {
            console.log('intersect');
        }

        this.drawPoints.push(worldPos);
        
        // Continue drawing line
        this.graphics.lineTo(worldPos.x, worldPos.y);
        this.graphics.stroke();
    }

    private onTouchEnd(event: EventTouch) {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        
        // Optional: Add final point if needed
        const touchPos = event.getLocation();
        const worldPos = this.screenToWorld(touchPos);
        this.drawPoints.push(worldPos);
        
        // Complete the line
        this.graphics.lineTo(worldPos.x, worldPos.y);
        this.graphics.stroke();
    }

    private screenToWorld(screenPos: Vec2): Vec2 {
        // Convert screen coordinates to node local coordinates
        const worldPos = this.camera.screenToWorld(new Vec3(screenPos.x, screenPos.y, 0));
        const screenVec3 = new Vec3(worldPos.x, worldPos.y, 0);
        const localVec3 = this.node.getComponent(UITransform).convertToNodeSpaceAR(screenVec3);
        const result = new Vec2(localVec3.x, localVec3.y);
        return result;
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
}

