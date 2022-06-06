class BaseLabel {
    constructor(viewer,position, options) {
      this._viewer = viewer
      this._position=position;
      this._options = options
      this._label=null;
    }
    addTo(){

    }
    setStyle(){

    }
    startEdit() {
      this._edit = true;
     
    }
    closeEdit() {
      this._edit = false;
    }
    on(type, callback, context) {
      this._label._overlayEvent.on(type, callback, context || this)
      return this
    }
     /**
     *
     * @param {*} type
     * @param {*} callback
     * @param {*} context
     */
    off(type, callback, context) {
      this._label._overlayEvent.off(type, callback, context || this)
      return this
    }
  
    /**
     *
     * @param {*} type
     * @param {*} param
     */
    fire(type, params) {
      this._label._overlayEvent.fire(type, params)
      return this
    }
  }
  export default BaseLabel
  