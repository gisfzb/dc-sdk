/**
 * @Author: Caven
 * @Date: 2019-12-27 14:35:02
 */

import Transform from '../transform/Transform'

const { Cesium } = DC.Namespace

class Position {
  constructor(lng, lat, alt, heading, pitch, roll) {
    this._lng = lng || 0
    this._lat = lat || 0
    this._alt = alt || 0
    this._heading = heading || 0
    this._pitch = pitch || 0
    this._roll = roll || 0
  }

  set lng(lng) {
    this._lng = +lng
  }

  get lng() {
    return this._lng
  }

  set lat(lat) {
    this._lat = +lat
  }

  get lat() {
    return this._lat
  }

  set alt(alt) {
    this._alt = +alt
  }

  get alt() {
    return this._alt
  }

  set heading(heading) {
    this._heading = +heading
  }

  get heading() {
    return this._heading
  }

  set pitch(pitch) {
    this._pitch = +pitch
  }

  get pitch() {
    return this._pitch
  }

  set roll(roll) {
    this._roll = +roll
  }

  get roll() {
    return this._roll
  }

  serialize() {
    let position = new Position(
      this._lng,
      this._lat,
      this._alt,
      this._heading,
      this._pitch,
      this._roll
    )
    return JSON.stringify(position)
  }

  /**
   * Calculate the distance between two positions
   * @param target
   * @returns {number}
   */
  distance(target) {
    if (!target || !(target instanceof Position)) {
      return 0
    }
    return Cesium.Cartesian3.distance(
      Transform.transformWGS84ToCartesian(this),
      Transform.transformWGS84ToCartesian(target)
    )
  }

  /**
   *
   * @returns {Position}
   */
  copy() {
    let position = new Position()
    position.lng = this.lng || 0
    position.lat = this.lat || 0
    position.alt = this.alt || 0
    position.heading = this.heading || 0
    position.pitch = this.pitch || 0
    position.roll = this.roll || 0
    return position
  }

  /**
   *
   * @returns {*[]}
   */
  toArray() {
    return [this.lng, this.lat, this.alt, this.heading, this.pitch, this.roll]
  }

  /**
   *
   * @returns {string}
   */
  toString() {
    return `${this.lng},${this.lat},${this.alt},${this.heading},${this.pitch},${this.roll}`
  }

  /**
   *
   * @param arr
   * @returns {Position}
   */
  static fromArray(arr) {
    let position = new Position()
    if (Array.isArray(arr)) {
      position.lng = arr[0] || 0
      position.lat = arr[1] || 0
      position.alt = arr[2] || 0
      position.heading = arr[3] || 0
      position.pitch = arr[4] || 0
      position.roll = arr[5] || 0
    }
    return position
  }

  /**
   *
   * @param str
   * @returns {Position}
   */
  static fromString(str) {
    let position = new Position()
    if (str && typeof str === 'string') {
      let arr = str.split(',')
      position = this.fromArray(arr)
    }
    return position
  }

  /**
   * Deserialize
   * @param valStr
   * @returns {Position}
   */
  static deserialize(valStr) {
    let position = new Position()
    let obj = JSON.parse(valStr)
    if (obj) {
      position.lng = obj.lng || 0
      position.lat = obj.lat || 0
      position.alt = obj.alt || 0
      position.heading = obj.heading || 0
      position.pitch = obj.pitch || 0
      position.roll = obj.roll || 0
    }
    return position
  }

  /**
   *  Returns position from coord String
   * @param str
   * @returns {Position}
   */
  static fromCoordString(str) {
    let position = new Position()
    if (str && typeof str === 'string') {
      position = this.fromCoordArray(str.split(','))
    }
    return position
  }

  /**
   * Returns position from coord array
   * @param arr
   * @returns {Position}
   */
  static fromCoordArray(arr) {
    let position = new Position()
    if (Array.isArray(arr)) {
      position.lng = arr[0] || 0
      position.lat = arr[1] || 0
      position.alt = arr[2] || 0
    }
    return position
  }
}

export default Position
