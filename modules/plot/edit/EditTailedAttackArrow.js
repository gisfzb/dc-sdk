/**
 * @Author: Caven
 * @Date: 2020-08-30 23:46:07
 */

import { Cesium } from '@dc-modules/namespace'
import Edit from './Edit'
import TailedAttackArrowGraphics from '../graphics/TailedAttackArrowGraphics'

class EditTailedAttackArrow extends Edit {
  constructor(overlay) {
    super(overlay)
    this._graphics = new TailedAttackArrowGraphics()
  }

  /**
   *
   * @private
   */
  _mountedHook() {
    this._delegate.polygon.hierarchy = new Cesium.CallbackProperty(() => {
      if (this._positions.length > 2) {
        this._graphics.positions = this._positions
        return this._graphics.hierarchy
      } else {
        return null
      }
    }, false)
    this._layer.entities.add(this._delegate)
  }
}

export default EditTailedAttackArrow
