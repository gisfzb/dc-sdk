const { Cesium } = DC.Namespace
import BaseLabel from './BaseLabel'
import { DivIcon} from '../../overlay'
import { MouseEventType } from '../../event';
import CesiumUtils from '../utils/CesiumUtils'
import LabelUtils from './LabelUtils';
import ElliposidFadeMaterialProperty from '../utils/ElliposidFadeMaterial'

class BrokenLineLabel extends BaseLabel {
    constructor(viewer, position, options){
        super(viewer, position, options)
        this._drag = false

        var id = Cesium.defaultValue(options.id, CesiumUtils.getID(10));
        if (id.indexOf('billboard') >= 0) {
            id = id.substring(9);
        }
        var canvas = LabelUtils.createHiDPICanvas(100, 50, 25);
        var color = Cesium.defaultValue(options.color, 'rgba(94, 170, 241, 1)');
        var panColor = Cesium.defaultValue(options.panColor, 'rgba(94, 170, 241, 1)');
        panColor = LabelUtils.paseRgba(panColor, 'GLH');
    
        var text = Cesium.defaultValue(options.text, '请输入：')
        var size = Cesium.defaultValue(options.size, 5);
        var isChange = Cesium.defaultValue(options.isChange, true);
        var background = Cesium.defaultValue(options.background, 'background1');
        var backgroundPicture;
        switch (background) {
            case 'background1':
                backgroundPicture = Cesium.buildModuleUrl('Images/videoBorad.png');
                break;
            case 'background2':
                backgroundPicture = Cesium.buildModuleUrl('Images/labelbackground1.png');
                break;
            case 'background3':
                backgroundPicture = Cesium.buildModuleUrl('Images/labelbackground2.png');
                break;
            default:
                backgroundPicture = Cesium.buildModuleUrl('Images/videoBorad.png');
                break;
        }

        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 100, 50);
        ctx.textAlign = 'center';
        ctx.strokeStyle = color;
        ctx.font = '6px 微软雅黑';
        ctx.fillStyle = color;
        var str = text.length;
        var roll = Math.ceil(str / 14) <= 3 ? Math.ceil(str / 14) : 3;
        var rolladd = 1;
        while (rolladd <= roll) {
            ctx.fillText(text.substring((rolladd - 1) * 14, rolladd * 14), 50, 25 + (rolladd - 1) * 7);
            rolladd++;
            
        console.log("99999999999999999999",canvas)
        }

        // this._label = ctx;

        // this._label = new DivBillboard(
        //     new DC.Position.fromCoordArray(this._position),
        //     `<h1>QQQ</h1>`
        // )
        this._label = new Array();
        let entity = new Cesium.Entity({
            position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
            name: 'picturebillboard' + id,
            id: 'picturebillboard' + id,
            billboard: {
                image: backgroundPicture,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scale: size,
                width: 100,
                height: 50,
                sizeInMeters: isChange
            },
            ellipse: {
                semiMinorAxis: 150,
                semiMajorAxis: 150,
                height: position[2] - 100,
                material: new ElliposidFadeMaterialProperty(CesiumUtils.getCesiumColor(panColor), 4000)
            }
        })
        this._label.push(entity)

        let entity2 = new Cesium.Entity({
            position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
            name: 'billboard' + id,
            id: 'billboard' + id,
            description: { heights: position[2], color: color, text: text },
            billboard: {
                image: canvas,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scale: size,
                width: 100,
                height: 50,
                sizeInMeters: isChange
            },
            cylinder: {
                length: 1000 + position[2],
                topRadius: 200,
                bottomRadius: 200,
                material: new Cesium.Color(1, 1, 1, 0.01)
            }
        })
        this._label.push(entity2)
        // this._label = DivIcon.fromEntity(entity2,"test")
        // this._label = entity2
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
        // layer.entities.add(this._label);
        this._label.forEach(function(val, index, arr){
            viewer.entities.add(val)
        })
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
export default BrokenLineLabel

