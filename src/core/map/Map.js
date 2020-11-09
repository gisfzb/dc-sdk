const { Cesium } = DC.Namespace
import Viewer from '../viewer/Viewer'
import BaseImageryLayers from './Layers/BaseImageryLayers';
import EffectsFactory from './effects/EffectsFactory';
import LabelFactory from './labels/LableFactory';
import { MouseEventType } from '../event/EventType';
var defaultOptions = {
    widgets: {
        baseLayerPicker: true, //是否显示
        baselayerList: [
            {
                type: 'ArcGisMapServerImageryProvider',
                url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer'
            }
        ]
    },

    baseImageryLayers: [
        {
            type: 'ArcGisMapServerImageryProvider',
            url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer'
        }
    ]
}
class Map {
    constructor(id, options, callback) {
        this.options = {
            ...options,
            ...defaultOptions
        }
        this._edit = false
        this._labels = []
        this.initMap(id);
        this.callback = callback;
        this.initEditEvents();
    }
    //底图初始化
    initMap(id) {
        this.viewer = new Viewer(id);

        console.log("创建viewer")

        //初始化底图
        this.baseImageryLayers = new BaseImageryLayers(
            this.viewer.delegate,
            this.options.baseImageryLayers
                ? this.options.baseImageryLayers
                : defaultOptions.baseImageryLayers
        )

        this.viewer.locationBar.enable = true   //显示经纬度信息

        let defaultOptions = {
            "showAtmosphere": false,

        }
        this.viewer.setOptions(defaultOptions);

        //全局特效
        this._effectsFactory = new EffectsFactory(this.viewer);
        //自由标记
        this._labelFactory = new LabelFactory(this.viewer);
    }
    //地图事件初始化
    initEditEvents() {
        if (this._edit) {
          this.viewer.delegate.screenSpaceEventHandler.setInputAction(
            this._handlerClickEvent.bind(this),
            Cesium.ScreenSpaceEventType.LEFT_DOWN
          )
          this.viewer.delegate.screenSpaceEventHandler.setInputAction(
            this.leftUpAction,
            Cesium.ScreenSpaceEventType.LEFT_UP
          )
          this.viewer.delegate.screenSpaceEventHandler.setInputAction(
            this._handlerMouseMoveEvent.bind(this),
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
          )
        } else {
          this.viewer.delegate.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOWN
          )
          this.viewer.delegate.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_UP
          )
          this.viewer.delegate.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
          )
        }
    }

    _handlerClickEvent(e) {
    var position = this.viewer.delegate.scene.camera.pickEllipsoid(
        e.position,
        this.viewer.delegate.scene.globe.ellipsoid
    )
    var ellipsoid = this.viewer.delegate.scene.globe.ellipsoid
    var cartographic = ellipsoid.cartesianToCartographic(position)
    var lat = Cesium.Math.toDegrees(cartographic.latitude)
    var lng = Cesium.Math.toDegrees(cartographic.longitude)

    let labelopt = {
        type: 'TaperLabel', // BrokenLineLabel DipChartLabel ChartLabel GlintLabel TaperLabel
        position: [lng, lat, 0],
        // background: 'null',
        selectEvents: () => {},
        createEvents: () => {},
        getPosition: () => {}
    }
    let label = this._labelFactory.create(labelopt.position, labelopt)
    label.startEdit();
    // debugger
    // console.log(Cesium.ScreenSpaceEventType.LEFT_UP)
    // label.on(MouseEventType.LEFT_DOWN, this._handlerDragStartEvent.bind(this))
    // label.on(MouseEventType.LEFT_UP, this._handlerDragEndEvent.bind(this))
    // label.on(MouseEventType.MOUSE_MOVE, this._handlerMouseMoveEvent.bind(this))
    // this._labels.push(label)
    // var selectedLabel = this.viewer.delegate.scene.pick(e.position)
    }
    _handlerDragStartEvent(evt, opt) {
    debugger
    this.drag = true
    }
    _handlerDragEndEvent(evt, opt) {
    debugger
    this.drag = false
    }
    _handlerMouseMoveEvent(evt) {
    if(this.drag){
        let point={
        x:evt.position.x,
        y:evt.position.y-20
        }
        var position = this.viewer.delegate.scene.camera.pickEllipsoid(
        point,//Parse.parsePosition(point),
        this.viewer.delegate.scene.globe.ellipsoid
        )
        var ellipsoid = this.viewer.delegate.scene.globe.ellipsoid
        var cartographic = ellipsoid.cartesianToCartographic(position)
        var lat = Cesium.Math.toDegrees(cartographic.latitude)
        var lng = Cesium.Math.toDegrees(cartographic.longitude)
        let  p= [lng, lat, 0];
        evt.overlay._label.setPosition(p);
    }
    }
    

    //添加特效
    addEffect(options) {
        this._effectsFactory.add(options);
    }
    //删除特效
    removeEffect(options) {
        this._effectsFactory.remove(options);
    }

    //开始编辑
    startEdit(){
        this._edit = true;
        // this._labels.forEach(item =>{
        //     item.startEdit();
        // });
        this.initEditEvents();
    }
    //结束编辑
    closeEdit(){
        this._edit = false;
        // this._labels.forEach(item=>{
        //     item.closeEdit();
        // });
        this.initEditEvents();
    }

    //添加标记
    addLabel(options){
        console.log(options);
        // this._labelFactory.create(options);
        this._edit = true;
        this.initEditEvents();
    }
    //更新注记
    updateLabel(options){
        // this._labelFactory.update(options)
    }
    //删除标记
    removeLabel(options){
        console.log(options)
    }




}
export default Map;