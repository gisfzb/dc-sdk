const { Cesium } = DC.Namespace

import { LabelsType } from './LabelsType'
import { HtmlLayer } from '../../layer'
import DipChartLabel from './DipChartLabel'
import BrokenLineLabel from './BrokenLineLabel'
import ChartLabel from './ChartLabel'
import GlintLabel from './GlintLabel'
import TaperLabel from './TaperLabel'
import CesiumUtils from '../utils/CesiumUtils.js';
import defined from '../utils/defined.js';
import LabelUtils from './LabelUtils'
class LableFactory {
  //构造函数
  constructor(viewer) {
    //获取原始viewer对象
    this.viewer = viewer
    this.pickEntityName = null;
    this.pointDraged = null;
    this.leftDownFlag = false;

    this._htmlLayers = new HtmlLayer('html_layer')
    viewer.addLayer(this._htmlLayers);

    this._vectorLayer = new DC.VectorLayer('vector_layer')
    viewer.addLayer(this._vectorLayer);

    this.initLabel();
  }

  initLabel(){
    this.taperLabel = new TaperLabel(this.viewer);
    this.brokenLineLabel = new BrokenLineLabel(this.viewer);
    this.glintLabel = new GlintLabel(this.viewer);
    this.chartLabel = new ChartLabel(this.viewer);
    this.dipChartLabel = new DipChartLabel(this.viewer);
  }

  add(options, isClick) {
    let viewer = this.viewer.delegate;
    this.options = options;
    this.isClick = Cesium.defaultValue(isClick, false);
    this.selectEvents = Cesium.defaultValue(this.options.selectEvents, function () { });
    this.createEvents = Cesium.defaultValue(this.options.createEvents, function () { });
    this.getPosition = Cesium.defaultValue(this.options.getPosition, function () { });
    this.type = Cesium.defaultValue(this.options.type, LabelsType.TAPER_LABEL);

    //注册事件
    if (this.isClick) {
      viewer.screenSpaceEventHandler.setInputAction(this.leftDownAction.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
      viewer.screenSpaceEventHandler.setInputAction(this.leftUpAction.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);
      viewer.screenSpaceEventHandler.setInputAction(this.mouseMoveAction.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      viewer.screenSpaceEventHandler.setInputAction(this.leftClickAction.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } else {

      // viewer.screenSpaceEventHandler.removeInputAction
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }

  createLabel(position) {
    let addOption = {
      position: [position[0], position[1], 50],
      id: CesiumUtils.getID(10)
    }
    let addOption1 = {
      position: [position[0], position[1], 0],
      id: CesiumUtils.getID(10)
    }
    switch (this.type) {
      case LabelsType.DIP_CHART_LABEL: //DIP chart
        this.dipChartLabel._create(addOption1, this.createEvents);
        break
      case LabelsType.CHART_LABEL: //图表式
        this.chartLabel._create(addOption1, this.createEvents);
        break;
      case LabelsType.BROKEN_LINE_LABEL: //折线
        this.brokenLineLabel._create(addOption1, this.createEvents);
        break
      case LabelsType.GLINT_LABEL: //闪烁
        this.glintLabel._create(addOption1, this.createEvents);
        break;
      case LabelsType.TAPER_LABEL:  //锥体
        this.taperLabel._create(addOption, this.createEvents);
        break;
      default:
        break
    }
  }

  update(option) {
    if (LabelUtils.pdValues(option) && LabelUtils.pdValues(option.type)) {
      switch (option.type) {
        case LabelsType.DIP_CHART_LABEL:
          new DipChartLabel(this.viewer, option);
          break
        case LabelsType.CHART_LABEL:
          new ChartLabel(this.viewer, option);
          break;
        case LabelsType.BROKEN_LINE_LABEL:
          new BrokenLineLabel(this.viewer, option);
          break
        case LabelsType.GLINT_LABEL: //闪烁
          this.glintLabel._update(option);
          break;
        case LabelsType.TAPER_LABEL:  //锥体
          this.taperLabel._update(option)
          break;
        default:
          break
      }
    }
  }

  delete(id) {
    let viewer = this.viewer
    var entity1 = this.viewer.entities.getById(id);
    var entity2 = this.viewer.entities.getById('picture' + id);
    this.viewer.entities.remove(entity1);
    this.viewer.entities.remove(entity2);
    var that = this;
    //为了删除下面的实体
    var primitivesArr = new Array();
    for (var index = 0; index < that.viewer.scene.primitives.length; index++) {
        var primitive = that.viewer.scene.primitives.get(index);
        primitivesArr.push(primitive);
    }
    primitivesArr.forEach(function(ele) {
        if (defined(ele._instanceIds)) {
            if (ele._instanceIds[0] === id + 'instance1' || ele._instanceIds[0] === id + 'instance2') {
                that.viewer.scene.primitives.remove(ele);
            }
        }
    });
  }

  // create(position,opt) {
  //   let label = null
  //   switch (opt.type) {
  //     case LabelsType.DIP_CHART_LABEL:
  //       label = new DipChartLabel(this.viewer,position,opt)
  //       label.addTo(this._htmlLayers)
  //       break
  //     case LabelsType.CHART_LABEL:
  //       label = new ChartLabel(this.viewer, position, opt)
  //       label.addTo(this.viewer.delegate);
  //       break;
  //     case LabelsType.BROKEN_LINE_LABEL:
  //       label = new BrokenLineLabel(this.viewer, opt); //创建实体
  //       label.addTo(this.viewer.delegate);
  //       break
  //     case LabelsType.GLINT_LABEL:
  //       label = new GlintLabel(this.viewer, opt);
  //       label.addTo(this.viewer.delegate);
  //       break;
  //     case LabelsType.TAPER_LABEL:
  //       label = new TaperLabel(this.viewer, opt);
  //       label.addTo(this._vectorLayer);
  //       break;
  //     default:
  //       break
  //   }
  //   return label;
  // }

  /**
   * 鼠标单击事件
   * @param {*} e 
   */
  leftClickAction(e) {
    if (this.pointDraged === null && this.leftDownFlag === false) {
      let position = this.getLocation(e);

      this.createLabel(position); //新建标记
    }
  }

  /**
   * 鼠标按下事件
   * @param {*} e 
   */
  leftDownAction(e) {
    let viewer = this.viewer.delegate;
    this.pointDraged = viewer.scene.pick(e.position);
    if (typeof this.pointDraged === 'object' && typeof this.pointDraged.id === 'object') {
      this.pickEntityName = this.pointDraged.id.id;
      //  if (this.pickEntityName.indexOf('billboard') >= 0) {
      this.selectEvents(this.pickEntityName);
      this.leftDownFlag = true;
      //禁用鼠标漫游事件
      viewer.scene.screenSpaceCameraController.enableRotate = false;
      //  }
    }
  }

  /**
   * 鼠标释放事件
   * @param {*} e 
   */
  leftUpAction(e) {
    let viewer = this.viewer.delegate;
    this.pointDraged = viewer.scene.pick(e.position);
    if (typeof this.pointDraged === 'object' && typeof this.pointDraged.id === 'object') {
      this.pickEntityName = this.pointDraged.id.id;
      let position = this.getLocation(e);
      let height = (LabelUtils.pdValues(this.pointDraged.id.description) ? this.pointDraged.id.description.getValue().heights : 0);

      let st = {
        id: this.pickEntityName,
        position: [position[0], position[1], height]
      };
      this.getPosition(st);
    }

    this.leftDownFlag = false;
    this.pointDraged = null;
    viewer.scene.screenSpaceCameraController.enableRotate = true;
  }

  /**
   * 鼠标移动事件
   * @param {*} e 
   */
  mouseMoveAction(e) {
    let viewer = this.viewer.delegate;
    let moveOverEntity = viewer.scene.pick(e.endPosition);
    if (CesiumUtils.pdValues(moveOverEntity)) {
      if (CesiumUtils.pdValues(moveOverEntity.id) && typeof moveOverEntity.id !== 'string') {
        if (moveOverEntity.id.id.indexOf('billboard') >= 0) {
          viewer._container.style.cursor = "pointer";
        }
      }
    } else {
      viewer._container.style.cursor = "auto";
    }
    if (this.leftDownFlag === true && this.pointDraged !== null && this.pointDraged.id.id.indexOf('billboard') >= 0) {
      let ray = viewer.camera.getPickRay(e.endPosition);
      let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      let ellipsoid = viewer.scene.globe.ellipsoid;
      let cartographic = ellipsoid.cartesianToCartographic(cartesian);
      let lat = Cesium.Math.toDegrees(cartographic.latitude);
      let lng = Cesium.Math.toDegrees(cartographic.longitude);
      let height = (LabelUtils.pdValues(this.pointDraged.id.description) ? this.pointDraged.id.description.getValue().heights : 0);
      cartesian = Cesium.Cartesian3.fromDegrees(lng, lat, height, ellipsoid);
      this.pointDraged.id.position.setValue(cartesian);
    }
  }

  //获取经纬度坐标
  getLocation(e) {
    let viewer = this.viewer.delegate
    let position = viewer.scene.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
    let ellipsoid = viewer.scene.globe.ellipsoid;
    let cartographic = ellipsoid.cartesianToCartographic(position);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    let lng = Cesium.Math.toDegrees(cartographic.longitude);
    return [lng, lat]
  }

}

export default LableFactory;
