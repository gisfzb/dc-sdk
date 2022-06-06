import { EffectsType } from './EffectsType'

class EffectsFactory {
    //构造函数
    constructor(viewer) {
        this.viewer = viewer;
        this.effect = {}
    }
    create(options) {
        let effect = null;
        let position = new DC.Position(108.94236657350004, 34.260947782525065, 20);
        switch (options.type) {
            case EffectsType.RAIN_EFFECT:
                effect = new DC.RainEffect('rain');
                this.effect.RainEffect = effect
                break;
            case EffectsType.SNOW_EFFECT:
                effect = new DC.SnowEffect('snow');
                this.effect.SnowEffect = effect
                break;
            case EffectsType.FOG_EFFECT:
                effect = new DC.FogEffect('fog', DC.Color.BLACK, {
                    near: 100,
                    nearValue: 0,
                    far: 2000,
                    farValue: 1.0,
                });
                this.effect.FogEffect = effect
                break;
            case EffectsType.BLOOM_EFFECT:
                effect = new DC.BloomEffect('bloom', {
                    contrast: 50,
                    brightness: 20
                })
                this.effect.BloomEffect = effect
                break;
            case EffectsType.RADAR_SCAN_EFFECT:
                effect = new DC.RadarScanEffect(
                    'radar',
                    position,
                    1000,
                    DC.Color.RED,
                    10
                );
                this.effect.RadarScanEffect = effect
                break;
            case EffectsType.CIRCLE_SCAN_EFFECT:
                effect = new DC.CircleScanEffect(
                    'circle',
                    position,
                    1000,
                    DC.Color.RED,
                    10
                )
                this.effect.CircleScanEffect = effect
                break;
            case EffectsType.BRIGHT_NESS_EFFECT:
                effect = new DC.BrightnessEffect('brightness', 1.5)
                this.effect.BrightnessEffect = effect
                break;
            default:
                break;
        }
        return effect;
    }

    add(options) {
        let type = options.type;
        if (type == EffectsType.SHOW_ATMOSPHERE) {
            this.viewer.setOptions({"showAtmosphere": true});
        } else {
            let effect = this.get(options)
            if (!effect) {
                effect = this.create(options);
            }
            this.viewer.addEffect(effect);
        }
    }

    remove(options) {
        let type = options.type;
        if (type == EffectsType.SHOW_ATMOSPHERE) {
            this.viewer.setOptions({"showAtmosphere": false});
        } else {
            let effect = this.get(options);
            if (effect) {
                this.viewer.removeEffect(effect);
            }
        }
    }
    get(options){
        let type = options.type;
        let effect = null;
        if (this.effect && type && this.effect[type]) {
            effect  = this.effect[type];           
        }
        return effect;
    }
}

export default EffectsFactory