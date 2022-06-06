import { Cesium } from '@dc-modules/namespace'
var LabelControl = {
    typename: "label",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            //name: 'Entity ' + arrEntity.length,
            label: entityattr,
            attribute: attribute
        });

        return entity;
    },
    attribute2Entity: function (attribute, entityattr) {
        attribute=attribute||{};
        attribute.style=attribute.style||{};
        if (entityattr == null) {
            //默认值
            entityattr = {
                scale: 1.0,
                //disableDepthTestDistance:Number.POSITIVE_INFINITY,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            };
        }

        //Style赋值值Entity
        for (var key in attribute.style) {
            var value = attribute.style[key];
            switch (key) {
                default:    //直接赋值
                    entityattr[key] = value;
                    break;
                case "font_style":    //跳过扩展其他属性的参数
                case "font_weight":
                case "font_size":
                case "font_family":
                case "text":
                case "scaleByDistance_near":
                case "scaleByDistance_nearValue":
                case "scaleByDistance_far":
                case "scaleByDistance_farValue":
                case "distanceDisplayCondition_far":
                case "distanceDisplayCondition_near":
                case "background_opacity":
                    break;
                case "color": //颜色
                    entityattr.fillColor = new Cesium.Color.fromCssColorString(value || "#ffffff")
                        .withAlpha(Number(attribute.style.opacity || 1.0));
                    break;

                case "border": //是否衬色
                    entityattr.style = (value ? Cesium.LabelStyle.FILL_AND_OUTLINE : Cesium.LabelStyle.FILL);
                    break;
                case "border_color":    //衬色
                    entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#000000")
			            .withAlpha(Number(attribute.style.opacity || 1.0));
                    break;
                case "border_width":
                    entityattr.outlineWidth = value;
                    break;
                case "background": //是否背景色
                    entityattr.showBackground = value;
                    break;
                case "background_color": //背景色
                    entityattr.backgroundColor = new Cesium.Color.fromCssColorString(value || "#000000")
                        .withAlpha(Number(attribute.style.background_opacity ||attribute.style.opacity || 0.5));
                    break;
                case "pixelOffset": //偏移量
                    entityattr.pixelOffset = new Cesium.Cartesian2(attribute.style.pixelOffset[0], attribute.style.pixelOffset[1]);
                    break;
                case "scaleByDistance":   //是否按视距缩放
                    if (value) {
                        entityattr.scaleByDistance = new Cesium.NearFarScalar(
                            Number(attribute.style.scaleByDistance_near || 1000),
                            Number(attribute.style.scaleByDistance_nearValue || 1.0),
                            Number(attribute.style.scaleByDistance_far || 1000000),
                            Number(attribute.style.scaleByDistance_farValue || 0.1));
                    } else {
                        entityattr.scaleByDistance = null;
                    }
                    break;
                case "distanceDisplayCondition":   //是否按视距显示
                    if (value) {
                        entityattr.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
                            Number(attribute.style.distanceDisplayCondition_near || 0),
                            Number(attribute.style.distanceDisplayCondition_far || 100000));
                    } else {
                        entityattr.distanceDisplayCondition = null;
                    }
                    break;
            }
        }


        //文字内容
        entityattr.text = (attribute.style.text || '文字').replace(new RegExp("<br />", "gm"), "\n");

        //样式（倾斜、加粗等）
        var fontStyle = (attribute.style.font_style || "normal") + " small-caps "
            + (attribute.style.font_weight || "normal") + " " +
			(attribute.style.font_size || "25") + "px " + (attribute.style.font_family || "楷体");
        entityattr.font = fontStyle;

        return entityattr;
    },
    getEditor: function (dataSource, entity, options) {
        return new _Editor(dataSource, entity, options);
    },
    setPositions: function (entity, position) {
        entity.position = new _DynamicProperty(position);
    },
    getPositions: function (entity) {
        return [entity.position._value];
    },
    getCoordinates: function (entity) {
        var positions = this.getPositions(entity);
        var coordinates = _drawutils.getCoordinates(positions);
        return coordinates;
    },
    toGeoJSON: function (entity) {
        var coordinates = this.getCoordinates(entity);

        return {
            type: "Feature",
            properties: entity.attribute,
            geometry: {
                type: "Point",
                coordinates: coordinates[0]
            }
        };
    }

};

export default LabelControl;