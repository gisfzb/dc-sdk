const { Cesium } = DC.Namespace
import Viewer from '../viewer/Viewer'
import LayerFactory from './Layers/LayerFactory'
import EffectsFactory from './effects/EffectsFactory';
import LabelFactory from './labels/LableFactory';
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
        // this.initEditEvents();
        this.layerCache = {};

    }
    //底图初始化
    initMap(id) {
        let options = {
                animation: false, //是否显示动画控件
                geocoder: false,
                homeButton: false, //是否显示home
                timeline: false, //是否显示时间线控件
                fullscreenButton: true, //是否全屏显示
                scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
                infoBox: false, //是否显示点击要素之后显示的信息
                sceneModePicker: false, //是否显示投影方式控件  三维/二维
                navigationInstructionsInitiallyVisible: false,
                navigationHelpButton: false, //是否显示帮助信息控件
                selectionIndicator: false, //是否显示指示器组件
                terrainShadows: Cesium.ShadowMode.DISABLED,
                baseLayerPicker: false
        }
        this.viewer = new Viewer(id, options);

        this.layerCache = this._layerCache

        this.viewer.locationBar.enable = true   //显示经纬度信息

        let defaultOptions = {
            "showAtmosphere": false
        }
        this.viewer.setOptions(defaultOptions);

        //图层加载
        this.layerFactory = new LayerFactory(this.viewer);
        //全局特效
        this._effectsFactory = new EffectsFactory(this.viewer);
        //自由标记
        this._labelFactory = new LabelFactory(this.viewer);

        //初始化底图
        let layerOption = {
            type: "ImageLayer",
            layers: this.options.baseImageryLayers
            ? this.options.baseImageryLayers
            : defaultOptions.baseImageryLayers
        }
        this.layerFactory._create(layerOption);

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
    this.drag = true
    }
    _handlerDragEndEvent(evt, opt) {
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
    addLabel(options, isClick){
        this._labelFactory.add(options, isClick);
    }
    //更新注记
    updateLabel(options){
        this._labelFactory.update(options);
    }
    //删除标记
    removeLabel(id){
        this._labelFactory.delete(id);
    }
}
export default Map;