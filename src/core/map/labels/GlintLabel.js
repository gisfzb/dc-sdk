const { Cesium } = DC.Namespace
import BaseLabel from './BaseLabel'
import { MouseEventType } from '../../event';
import CesiumUtils from '../utils/CesiumUtils'
import LabelUtils from './LabelUtils';
import ElliposidFadeMaterialProperty from './Material/ElliposidFadeMaterial'

class GlintLabel extends BaseLabel {
    constructor(viewer, options, getCreateID){
        super(viewer, options, getCreateID)
        // this._drag = false
        // this._label = null;
        var id = Cesium.defaultValue(options.id, CesiumUtils.getID(10));
        if (id.indexOf('billboard') >= 0) {
            id = id.substring(9);
        }

        let size = Cesium.defaultValue(options.size, 3);
        let position = Cesium.defaultValue(options.position, [108.933337, 34.26178, 0]);
        let text = Cesium.defaultValue(options.text, '90%');
        let color = Cesium.defaultValue(options.color, 'rgba(94, 170, 241, 1)');
        let panColor = Cesium.defaultValue(options.panColor, 'rgba(94, 170, 241, 1)');
        let isChange = Cesium.defaultValue(options.isChange, true);
        panColor = LabelUtils.paseRgba(panColor, 'GLH');
        getCreateID = Cesium.defaultValue(getCreateID, function() { });

    
        let canvas = LabelUtils.createHiDPICanvas(100, 500, 2);
        let ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.lineTo(50, 500);
        ctx.lineTo(50, 400);
        ctx.arc(50, 150, 48, 0.5 * Math.PI, 2.5 * Math.PI);
        ctx.stroke();
        ctx.font = '20px console';
        ctx.fillStyle = color;
        ctx.fillText(text, 25, 155);
        ctx.textAlign = 'center';
        this._label = new Cesium.Entity({
            description: { heights: position[2], color: color, text: text },
            name: 'billboard' + id,
            id: 'billboard' + id,
            position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
            billboard: {
                image: canvas,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scale: size,
                width: 20,
                height: 100,
                sizeInMeters: isChange
            },
            cylinder: {
                length: 400,
                topRadius: 180,
                bottomRadius: 180,
                material: new Cesium.Color(1, 1, 1, 0.01)
            }, 
            ellipse: {
                semiMinorAxis: 50,
                semiMajorAxis: 50,
                height: position[2],
                material: new ElliposidFadeMaterialProperty(CesiumUtils.getCesiumColor(panColor), 4000)
            }
        });

        var st = {
            id: this._label.id,
            position: options.position
        };
        getCreateID(st);

    }
    _createEntity(){

    }
    _handlerMouseDownEvent(evt){
        this._drag = true;

        var position = this._viewer.delegate.scene.camera.pickEllipsoid(
            e.position,
            this._viewer.delegate.scene.globe.ellipsoid
        )

        var ellipsoid = this._viewer.delegate.scene.globe.ellipsoid
        var cartographic = ellipsoid.cartesianToCartographic(position)
        var lat = Cesium.Math.toDegress(cartographic.latitude)
        var lng = Cesium.Math.toDegress(cartographic.longitude)

        let labelopt = {
            type: 'BrokenLineLabel',
            position: [lng, lat, 0],
            selectEvents: () => {},
            createEvent: () => {},
            getPosition: () => {}
        }

        let label = this._labelFactory.create(labelopt.position, labelopt)

        label.on(MouseEventType.LEFT_DOWN, this._handlerDragStartEvent.bind(this))
        label.on(MouseEventType.LEFT_UP, this._handlerDragEndEvent.bind(this))
        label.on(MouseEventType.MOUSE_MOVE, this._handlerMouseMoveEvent.bind(this))
        this._labels.push(label)

        var selectedLabel = this._viewer.delegate.scene.pick(e.position)
    }
    _handlerMouseUpEvent(evt){
        this._drag = false;
        this.fire(MouseEventType.LEFT_UP,{
            overlay: this,
            position: evt
        })
    }
    _handlerMouseMoveEvent(evt){
        this.fire(MouseEventType.MOUSE_MOVE, {
            overlay: this,
            position: evt
        })
    }
    addTo(viewer){
        // layer.addOverlay(this._label)
        viewer.entities.add(this._label);
        // this._label.forEach(function(val, index, arr){
        //     viewer.entities.add(val)
        // })
        // layer.addOverlay(this._label);
    }
    _mouseMoveAction (e){
        let point = {
            x: e.endPosition.x,
            y: e.endPosition.y-20
        }
        this.updatePosition();
    }
    updatePosition(point){
        if (this._drag && this._edit) {
            var position = this._viewer.delegate.scene.camera.pickEllipsoid(
                point,
                this._viewer.delegate.scene.globe.ellipsoid
            )
            var ellipsoid = this._viewer.delegate.scene.globe.ellipsoid
            var cartographic = ellipsoid.cartesianToCartographic(position)
            var lat = Cesium.Math.toDegress(cartographic.latitude)
            var lng = Cesium.Math.toDegress(cartographic.longitude)
            let p = [lng, lat, 0]
            this._label.setPosition(p);
        }
    }
    startEdit(){
        this._edit = true
        // this._label._trigon.addEventListener('mousedown', this._handlerMouseDownEvent.bind(this))
        // this._label._trigon.addEventListener('mouseup', this._handlerMouseUpEvent.bind(this))
        // this._label._trigon.addEventListener('mousemove', this._handlerMouseMoveEvent.bind(this))

        this._viewer.delegate.screenSpaceEventHandler.setInputAction(
            this._mouseMoveAction.bind(this),
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        )
    }
    closeEdit(){
        this._edit = false;
        // this._label._trigon.removeEventListener('mousedown', this._handlerMouseDownEvent.bind(this))
        // this._label._trigon.removeEventListener('mouseup', this._handlerMouseUpEvent.bind(this))
        // this._label._trigon.removeEventListener('mousemove',this._handlerMouseMoveEvent.bind(this))

        this._viewer.delegate.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        )
    }

}
export default GlintLabel

