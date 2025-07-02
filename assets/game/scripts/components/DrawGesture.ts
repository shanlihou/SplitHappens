import { _decorator, Component, EventTouch, Node } from 'cc';
import { DrawCut } from './DrawCut';
const { ccclass, property } = _decorator;

@ccclass('DrawGesture')
export class DrawGesture extends Component {
    @property(Node)
    drawCutNode: Node = null!;

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
        const drawCut = this.drawCutNode.getComponent(DrawCut);
        drawCut.onTouchStart(event);
    }

    private onTouchMove(event: EventTouch) {
        const drawCut = this.drawCutNode.getComponent(DrawCut);
        drawCut.onTouchMove(event);
    }

    private onTouchEnd(event: EventTouch) {
        const drawCut = this.drawCutNode.getComponent(DrawCut);
        drawCut.onTouchEnd(event);
    }
}

