const { Cesium } = DC.Namespace

import { LabelsType } from './LabelsType'
import { HtmlLayer } from '../../layer'
import DipChartLabel from './DipChartLabel'
import BrokenLineLabel from './BrokenLineLabel'
// import VideoLabel from './VideoLabel'
class LableFactory {
  //构造函数
  constructor(viewer) {
    this.viewer = viewer
    this._htmlLayers = new HtmlLayer('html_layer')
    this.viewer.addLayer(this._htmlLayers)
    // this._htmlLayers.addTo(this.viewer);
  }
  create(position,opt) {
    let label = null
    switch (opt.type) {
      case LabelsType.DIP_CHART_LABEL:
        label = new DipChartLabel(this.viewer,position,opt)
        label.addTo(this._htmlLayers)
        break
      case LabelsType.BROKEN_LINE_LABEL:
        label = new BrokenLineLabel(this.viewer, position, opt); //创建实体
        label.addTo(this.viewer.delegate);
        // label.addTo(this._htmlLayers)
        break
      // case LabelsType.VIDEO_LABEL:
      //   label = new VideoLabel(this.viewer, position, opt);
      //   label.addTo(this._htmlLayers);
      //   break
      default:
        break
    }
    return label;
  }
}

export default LableFactory;
