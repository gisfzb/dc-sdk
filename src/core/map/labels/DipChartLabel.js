import BaseLabel from './BaseLabel'
import { DivBillboard }  from '../../overlay'
import { MouseEventType } from '../../event'
const { Cesium } = DC.Namespace
class DipChartLabel extends BaseLabel {
  constructor(viewer, position, options) {
    super(viewer, position, options)
    this._drag = false
    this._label = new DivBillboard(
      // new DC.Position(this._position[0], this._position[1], this._position[2]),
        new DC.Position.fromCoordArray(this._position),
        `<div style="width:100%;position: absolute; top: 0px; left: 0px;line-height: 200px;box-shadow: rgba(33, 132, 216, 0.41) 0px 0px 18px inset;text-align: center;">暂无图表数据</div>`
    )

    this._label.setStyle("width:200px;height: 200px;position: absolute; top: 0px; left: 0px;border: 1px solid #2184d5;box-shadow: rgba(33, 132, 216, 0.41) 0px 0px 18px inset;");
  }
  _handlerMouseDownEvent(evt) {
    this._drag=true;
    // this.fire(MouseEventType.LEFT_DOWN, {
    //   overlay: this,
    //   position: evt
    // })

    var position = this._viewer.delegate.scene.camera.pickEllipsoid(
      evt,
      this._viewer.delegate.scene.globe.ellipsoid
    );

    var ellipsoid = this._viewer.delegate.scene.globe.ellipsoid
    var cartographic = ellipsoid.cartesianToCartographic(position)
    var lat = Cesium.Math.toDegrees(cartographic.latitude)
    var lng = Cesium.Math.toDegrees(cartographic.longitude)

    let labelopt = {
      type: 'DipChartLabel',
      position: [lng, lat, 0],
      selectEvents: () => {},
      createEvents: () => {},
      getPosition: () => {}
    }
    let label = this._labelFactory.create(labelopt.position, labelopt)
    debugger
    console.log(Cesium.ScreenSpaceEventType.LEFT_UP)
    label.on(MouseEventType.LEFT_DOWN, this._handlerDragStartEvent.bind(this))
    label.on(MouseEventType.LEFT_UP, this._handlerDragEndEvent.bind(this))
    label.on(MouseEventType.MOUSE_MOVE, this._handlerMouseMoveEvent.bind(this))
    this._labels.push(label)
    var selectedLabel = this._viewer.delegate.scene.pick(e.position)
  }
  _handlerMouseUpEvent(evt) {
    this._drag=false;
    this.fire(MouseEventType.LEFT_UP, {
      overlay: this,
      position: evt
    })
  }
  _handlerMouseMoveEvent(evt) {
    this.fire(MouseEventType.MOUSE_MOVE, {
      overlay: this,
      position: evt
    })
  }
  addTo(layer) {
    layer.addOverlay(this._label)
  }
  _mouseMoveAction(e) {
    let point={
      x:e.endPosition.x,
      y:e.endPosition.y-20
    }
   this.updatePosition(point);
  }
  updatePosition(point){
    if(this._drag&&this._edit){
        debugger
       
        var position = this._viewer.delegate.scene.camera.pickEllipsoid(
          point,//Parse.parsePosition(point),
          this._viewer.delegate.scene.globe.ellipsoid
        )
        var ellipsoid = this._viewer.delegate.scene.globe.ellipsoid
        var cartographic = ellipsoid.cartesianToCartographic(position)
        var lat = Cesium.Math.toDegrees(cartographic.latitude)
        var lng = Cesium.Math.toDegrees(cartographic.longitude)
        let  p= [lng, lat, 0];
        this._label.setPosition(p);
      }
  }
  startEdit() {
    this._edit = true
    this._label._trigon.addEventListener(
      'mousedown',
      this._handlerMouseDownEvent.bind(this)
    )
    this._label._trigon.addEventListener(
      'mouseup',
      this._handlerMouseUpEvent.bind(this)
    )
    this._label._trigon.addEventListener(
      'mousemove',
      this._handlerMouseMoveEvent.bind(this)
    )
    // debugger
    this._viewer.delegate.screenSpaceEventHandler.setInputAction(
      this._mouseMoveAction.bind(this),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    )
   
  }
  closeEdit() {
    this._edit = false;
    this._label._trigon.removeEventListener(
      'mousedown',
      this._handlerMouseDownEvent.bind(this)
    )
    this._label._trigon.removeEventListener(
      'mouseup',
      this._handlerMouseUpEvent.bind(this)
    )
    this._label._trigon.removeEventListener(
      'mousemove',
      this._handlerMouseMoveEvent.bind(this)
    )
    this._viewer.delegate.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    )
  }

  setStyle() {}
}
export default DipChartLabel
