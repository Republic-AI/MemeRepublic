import { _decorator, Component, Node, TiledLayer, TiledMap, Vec2 } from 'cc';
import { AStarStep } from './AStarStep'
const { ccclass, property } = _decorator;

@ccclass('AStar')
export class AStar extends Component {

    @property(TiledMap)
    public map:TiledMap = null;

    _open = [];
    _closed = [];
    _layerBarrier: TiledLayer

    start() {
        this._layerBarrier = this.map.getLayer('building');
    }

    update(deltaTime: number) {
        
    }
    
    _indexOfStepArray(value, stepArray) {
        for (let i = 0; i < stepArray.length; ++i) {
            if (value.equals(stepArray[i].position)) {
                return i;
            }
        }
        return -1;
    }
    
    _insertToOpen(step) {
        let stepF = step.f;
        let length = this._open.length;
        let i = 0;
        for (; i < length; ++i) {
            if (stepF <= this._open[i].f) {
                break;
            }
        }
        // insert to index i
        this._open.splice(i, 0, step);
    }
    
    moveToward(start, finish) {
        this._closed = [];
        this._open = [];
        let paths = [];
        
        // cc.log('find start: ' + start + ' to: ' + finish);
        this._open.push(new AStarStep(start));
        let pathFound = false;
        do {
            // cc.log('==============================================================');
            let currentStep = this._open.shift();
            // cc.log('currentStep: ' + currentStep);
            
            this._closed.push(currentStep);
            
            if (currentStep.position.equals(finish)) {
                // cc.log('finish :P');
                pathFound = true;
                let tmpStep = currentStep;
                do {  
                    paths.unshift(tmpStep.position);
                    tmpStep = tmpStep.last;
                } while (tmpStep !== null);
                
                this._open = [];
                this._closed = [];
                break;
            }
            
            let borderPositions = this._borderMovablePoints(currentStep.position);
            
            for (let i = 0; i < borderPositions.length; ++i) {
                let borderPosition = borderPositions[i];
                // cc.log('check: ' + borderPosition);
                // Check if the step isn't already in the closed set
                if (this._indexOfStepArray(borderPosition, this._closed) != -1) {
                    // cc.log('had in closed: ' + borderPosition);
                    // cc.log('remove check position: ' + borderPosition);
                    borderPositions.splice(i, 1);
                    i--;
                    continue;
                }
                
                let step = new AStarStep(borderPosition);
                let moveCost = this._costToMove(borderPosition, finish)
                let index = this._indexOfStepArray(borderPosition, this._open);
                
                if (index == -1) {
                    step.last = currentStep;
                    step.g = currentStep.g + moveCost;
                    let distancePoint = new Vec2(borderPosition.x - finish.x, borderPosition.y - finish.y)
                    step.h = Math.abs(distancePoint.x) + Math.abs(distancePoint.y);
                    this._insertToOpen(step);
                } else {
                    // cc.log('had in open: ' + step.toString());
                    step = this._open[index];
                    if (currentStep.g + moveCost < step.g) {
                        // cc.log('re insert into open: ' + step.toString());
                        step.g = currentStep.g + moveCost;
                        
                        // re insert
                        this._open.splice(index, 1);
                        this._insertToOpen(step);
                    }
                }
            }
        } while (this._open.length > 0);
        
        return paths;
    }
    
    _costToMove(positionLeft, positionRight) {
        return 1
        // if (this.moveType == AStarMoveType.EIGHT_DIRECTION) {
        //     /**
        //      * diagonal length: 1.41 ≈ Math.sqrt(x * x + y * y)
        //      * line length: 1
        //      * 
        //      * cost = length * 10
        //      * diagonal cost = 14 ≈ 14.1
        //      * cost line = 10 = 1 * 10
        //      */
        //     return (positionLeft.x != positionRight.x) && (positionLeft.y != positionRight.y) ? 14 : 10;
        // } else {
        //     return 1;
        // }
    }
    
    _borderMovablePoints(position) {
        var results = [];
        let hasTop = false;
        let hasBottom = false;
        let hasLeft = false;
        let hasRight = false;
        
        // top
        let top = new Vec2(position.x, position.y - 1);
        if (top.y >= 0 && this._layerBarrier.getTileGIDAt(top.x, top.y) === 0) {
            // cc.log('top: ' + top);
            results.push(top);
            hasTop = true;
        }
        // bottom
        let bottom = new Vec2(position.x, position.y + 1);
        if (bottom.y < this._layerBarrier.layerSize.height && this._layerBarrier.getTileGIDAt(bottom.x, bottom.y) === 0) {
            // cc.log('bottom: ' + bottom);
            results.push(bottom);
            hasBottom = true;
        }
        // left
        let left = new Vec2(position.x - 1, position.y);
        if (left.x >= 0 && this._layerBarrier.getTileGIDAt(left.x, left.y) === 0) {
            // cc.log('left: ' + left);
            results.push(left);
            hasLeft = true;
        }
        // right
        let right = new Vec2(position.x + 1, position.y);
        if (right.x < this._layerBarrier.layerSize.width && this._layerBarrier.getTileGIDAt(right.x, right.y) === 0) {
            // cc.log('right: ' + right);
            results.push(right);
            hasRight = true;
        }
        return results;
    }
}

