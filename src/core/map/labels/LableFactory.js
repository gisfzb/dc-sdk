const { Cesium } = DC.Namespace

import { LabelsType } from './LabelsType'
import { HtmlLayer } from '../../layer'
import DipChartLabel from './DipChartLabel'
import BrokenLineLabel from './BrokenLineLabel'
import ChartLabel from './ChartLabel'
import GlintLabel from './GlintLabel'
import TaperLabel from './TaperLabel'
class LableFactory {
  //构造函数
  constructor(viewer) {
    this.viewer = viewer
    this._htmlLayers = new HtmlLayer('html_layer')
    this.viewer.addLayer(this._htmlLayers);

    this._vectorLayer = new DC.VectorLayer('vector_layer')
    this.viewer.addLayer(this._vectorLayer);
  }
  create(position,opt) {
    let label = null
    switch (opt.type) {
      case LabelsType.DIP_CHART_LABEL:
        label = new DipChartLabel(this.viewer,position,opt)
        label.addTo(this._htmlLayers)
        break
      case LabelsType.CHART_LABEL:
        label = new ChartLabel(this.viewer, position, opt)
        label.addTo(this.viewer.delegate);
        break;
      case LabelsType.BROKEN_LINE_LABEL:
        label = new BrokenLineLabel(this.viewer, opt); //创建实体
        label.addTo(this.viewer.delegate);
        break
      case LabelsType.GLINT_LABEL:
        label = new GlintLabel(this.viewer, opt);
        label.addTo(this.viewer.delegate);
        break;
      case LabelsType.TAPER_LABEL:
        label = new TaperLabel(this.viewer, opt);
        label.addTo(this._vectorLayer);
        break;
      default:
        break
    }
    return label;
  }
}

export default LableFactory;
