import { _decorator, Camera, Component, EventTouch, Node, UITransform, Vec2, Vec3 } from 'cc';
import { DrawCut } from './DrawCut';
import { SpriteFramePixel } from './SpriteFramePixel';
const { ccclass, property } = _decorator;

@ccclass('DrawGesture')
export class DrawGesture extends Component {
    @property(Node)
    drawCutNode: Node = null!;

    @property(Node)
    hitTestNode: Node = null!;

    @property(Camera)
    mainCamera: Camera = null!;

    hitTestEnabled: boolean = true;

    start() {
        this.setupTouchEvents();
    }

    update(deltaTime: number) {
        
    }

    private setupTouchEvents() {
        // Add touch event listeners to the node
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        const touchPos = event.getLocation();
        const worldPos = this.screenToWorld(touchPos);
        if (this.hitTestEnabled) {
            const hitTest = this.hitTestNode.getComponent(SpriteFramePixel);
            if (hitTest.hitTest(worldPos.x, worldPos.y)) {
                console.log('hit');
            }
            return;
        }

        const drawCut = this.drawCutNode.getComponent(DrawCut);
        drawCut.onTouchStart(worldPos);
    }

    private onTouchMove(event: EventTouch) {
        const touchPos = event.getLocation();
        const worldPos = this.screenToWorld(touchPos);

        const drawCut = this.drawCutNode.getComponent(DrawCut);
        drawCut.onTouchMove(worldPos);
    }

    private onTouchEnd(event: EventTouch) {
        const touchPos = event.getLocation();
        const worldPos = this.screenToWorld(touchPos);

        const drawCut = this.drawCutNode.getComponent(DrawCut);
        drawCut.onTouchEnd(worldPos);
    }

    private screenToWorld(screenPos: Vec2): Vec2 {
        // Convert screen coordinates to node local coordinates
        const worldPos = this.mainCamera.screenToWorld(new Vec3(screenPos.x, screenPos.y, 0));
        const screenVec3 = new Vec3(worldPos.x, worldPos.y, 0);
        const localVec3 = this.node.getComponent(UITransform).convertToNodeSpaceAR(screenVec3);
        const result = new Vec2(localVec3.x, localVec3.y);
        return result;
    }
}

