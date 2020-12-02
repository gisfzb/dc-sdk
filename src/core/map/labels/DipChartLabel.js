import BaseLabel from './BaseLabel'
import { DivBillboard } from '../../overlay'
import { MouseEventType } from '../../event'

import CesiumUtils from '../utils/CesiumUtils'
import LabelUtils from './LabelUtils';
const { Cesium } = DC.Namespace
class DipChartLabel extends BaseLabel {
  constructor(viewer) {
    super(viewer)
    this.viewer = viewer;
  }
  _create(options, getCreateID) {
    let viewer = this.viewer;
    let id = Cesium.defaultValue(options.id, CesiumUtils.getID(10));
    if (id.indexOf('billboard') >= 0) {
      id = id.substring(9);
    }
    let text = Cesium.defaultValue(options.text, '');
    let height = Cesium.defaultValue(options.height, 150);
    let size = Cesium.defaultValue(options.size, 5);
    let color = Cesium.defaultValue(options.color, 'rgba(94, 170, 241, 1)');
    let panColor = Cesium.defaultValue(options.panColor, 'rgba(94, 170, 241, 1)');
    panColor = LabelUtils.paseRgba(panColor, 'GLH');
    let background = Cesium.defaultValue(options.background, 'background1');
    let position = Cesium.defaultValue(options.position, [108.933337, 34.26178, 200]);
    let isChange = Cesium.defaultValue(options.isChange, true);
    getCreateID = Cesium.defaultValue(getCreateID, function () { });

    // 用dc的方法试一试
    let mylayer = new DC.HtmlLayer(id);
    viewer.addLayer(mylayer);

    let location = new DC.Position(position[0], position[1], position[2]);
    let divIcon = new DivBillboard(
      location,
      '<div class="dipchart">暂无图表数据</div>'
    );
    divIcon.setStyle({
      "className": "content"
    });
    mylayer.addOverlay(divIcon)

    let st = {
      id: id,
      position: position,
    };
    getCreateID(st);
  }
  _update(option) {
    let viewer = this.viewer;
    let cartesian2;
    let entitys = viewer.entities._entities._array;
    if (LabelUtils.pdValues(option)) {
        if (LabelUtils.pdValues(option.id)) {
            for (var i = 0; i < entitys.length; i++) {
                if (entitys[i].id === option.id) {
                    if (LabelUtils.pdValues(option.color) || LabelUtils.pdValues(option.text) || LabelUtils.pdValues(option.background)) {
                        if (LabelUtils.pdValues(option.text)) {
                            entitys[i].description.getValue().text = option.text;
                        } else {
                            option.text = entitys[i].description.getValue().text;
                        }
                        if (LabelUtils.pdValues(option.color)) {
                            entitys[i].description.getValue().color = option.color;
                        } else {
                            option.color = entitys[i].description.getValue().color;
                        }
                        if (LabelUtils.pdValues(option.background)) {
                            entitys[i].description.getValue().background = option.background;
                        } else {
                            option.background = entitys[i].description.getValue().background;
                        }
                        LabelUtils.updateCanvas4(i, option.text, option.color, option.background, function(s) {
                            if (s) {
                                that.viewer.entities._entities._array[s.id].billboard.image.setValue(s.canvas);
                            }
                        });
                    }
                    if (LabelUtils.pdValues(option.height)) {
                        let cartesian = entitys[i].position._value;
                        let ellipsoid = viewer.scene.globe.ellipsoid;
                        let cartographic = ellipsoid.cartesianToCartographic(cartesian);
                        let lat = Cesium.Math.toDegrees(cartographic.latitude);
                        let lng = Cesium.Math.toDegrees(cartographic.longitude);
                        cartesian2 = Cesium.Cartesian3.fromDegrees(lng, lat, option.height, ellipsoid);
                        entitys[i].position._value = cartesian2;
                        entitys[i].description.heights = option.height;
                    }
                    if (LabelUtils.pdValues(option.size)) {
                        entitys[i].billboard.scale = option.size;
                    }
                    if (LabelUtils.pdValues(option.isChange)) {
                        entitys[i].billboard.scale = option.isChange;
                    }
                    if (LabelUtils.pdValues(option.panColor)) {
                        option.panColor = LabelUtils.paseRgba(option.panColor, 'GLH');
                        entitys[i].ellipse._material = new ElliposidFadeMaterialProperty(CesiumUtils.getCesiumColor(option.panColor), 4000);
                    }
                    if (LabelUtils.pdValues(option.picture)) {
                        entitys[i].billboard.image.setValue(option.picture);
                    }
                }
            }
        }
    }
  }
}
export default DipChartLabel
