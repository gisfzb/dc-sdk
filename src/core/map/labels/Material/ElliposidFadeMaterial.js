const { Cesium } = DC.Namespace

import defined from '../../utils/defined.js';

function ElliposidFadeMaterialProperty(color, duration) {
    this._definitionChanged = new Cesium.Event();
    this._color = Cesium.Color.BLUE;
    this.color = color;
    this.duration = duration;
    this._time = (new Date()).getTime();
}
Object.defineProperties(ElliposidFadeMaterialProperty.prototype, {
    isConstant: {
        get: function() {
            return false;
        }
    },
    definitionChanged: {
        get: function() {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});
ElliposidFadeMaterialProperty.prototype.getType = function(time) {
    return 'EllipsoidFade';
};
ElliposidFadeMaterialProperty.prototype.getValue = function(time, result) {
    if (!defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    return result;
};

ElliposidFadeMaterialProperty.prototype.equals = function(other) {
    return this === other ||
        (other instanceof ElliposidFadeMaterialProperty &&
            Cesium.Property.equals(this._color, other._color));
};

Cesium.Material.EllipsoidFadeType = 'EllipsoidFade';
Cesium.Material.ElliposidFadeMaterial = 'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
    czm_material material = czm_getDefaultMaterial(materialInput);\n\
    material.diffuse = 1.5 * color.rgb;\n\
    vec2 st = materialInput.st;\n\
    float dis = distance(st, vec2(0.5, 0.5));\n\
    float per = fract(time);\n\
    if(dis > per * 0.5){\n\
       discard;\n\
    }else {\n\
         material.alpha = color.a  * dis / per / 2.0;\n\
    }\n\
    return material;\n\
}';

Cesium.Material._materialCache.addMaterial(Cesium.Material.EllipsoidFadeType, {
    fabric: {
        type: Cesium.Material.EllipsoidFadeType,
        uniforms: {
            color: new Cesium.Color(1.0, 0, 0, 0.5),
            time: 0.2
        },
        source: Cesium.Material.ElliposidFadeMaterial
    },
    translucent: function() {
        return true;
    }
});

export default ElliposidFadeMaterialProperty;
