import { Cesium } from '@dc-modules/namespace'

import {BillboardControl as _BillboardControl} from './BillboardControl'
import {LabelControl as _LabelControl} from './LabelControl'
import {EllipseControl as _EllipseControl} from './EllipseControl'
import {PolylineControl as _PolylineControl} from './PolylineControl'
import {PolylineVolumeControl as _PolylineVolumeControl} from './PolylineVolumeControl'
import {PolygonControl as _PolygonControl} from './PolygonControl'
import {EllipsoidControl as _EllipsoidControl} from './EllipsoidControl'
import {WallControl as _WallControl} from './WallControl'
import {PointControl as _PointControl} from './PointControl'
import {RectangleControl as _RectangleControl} from './RectangleControl'
import {ModelControl as _ModelControl} from './ModelControl'
import {EventControl as _EventControl} from './EventControl'

//标绘控制器，总入口
var Draw2 = (function (options) {

    //各实体的控制类 type:类名
    var control = {
        billboard: _BillboardControl,
        label: _LabelControl,
        ellipse: _EllipseControl,
        polyline: _PolylineControl,
        polylineVolume: _PolylineVolumeControl,
        polygon: _PolygonControl,
        ellipsoid: _EllipsoidControl,
        wall: _WallControl,
        point: _PointControl,
        rectangle: _RectangleControl,
        model: _ModelControl
    };
    var viewer = options.viewer;
    var scene = viewer.scene;
    var dragIcon = options.dragIcon;
    
    var dataSource = new Cesium.CustomDataSource();
    viewer.dataSources.add(dataSource);

    var currentEntity = null;
    var arrEntity = [];

    var eventCortol = new _EventControl(viewer);

    //是否可以编辑
    var _hasEdit;

    function hasEdit(val) {
        if (_hasEdit != null && _hasEdit == val) return;

        _hasEdit = val;
        if (val) {
            //初始化编辑相关事件
            eventCortol.createEditSelectHandler(function (pickedEntity) { 
                if (currentEntity && currentEntity.inProgress)//正在绘制中entity跳出
                    return;
        
                if (pickedEntity == null) {
                    stopDraw();
                    if (options.onStopEditing && typeof (options.onStopEditing) == "function") {
                        options.onStopEditing(null);
                    }
                    return;
                }

                if (pickedEntity === currentEntity) //单击了当前entity跳出
                    return;

                 
                if (currentEntity && currentEntity.stopEditing) {
                    currentEntity.stopEditing();
                    currentEntity = null;
                }
                currentEntity = pickedEntity;
                if (currentEntity && currentEntity.startEditing) {
                    currentEntity.startEditing();
                } 
            });
            eventCortol.createEditDraggerHandler();
        } else {
            stopDraw();
            eventCortol.destroyEditHandler();
        }
    }
    hasEdit(options.hasEdit);

    //开始绘制
    function startDraw(attribute) {
        stopDraw();
        if (attribute == null || attribute.type == null) {
            throw '请传入需要绘制的类型参数';
            return;
        }
         
        var type = attribute.type;
        if (control[type] == null) {
            throw '传入的[' + type + ']类型参数有误';
            return;
        }
 
   
        attribute.style = attribute.style || {};
        attribute.attr = attribute.attr || {};
        
        //赋默认值  
        attribute = addPropertiesDefVal(attribute);

        var entity = control[type].startDraw(dataSource, attribute);


        switch (type) {
            case "label":
            case "point":
            case "billboard":
            case "model":
            case "ellipse":
            case "ellipsoid"://点
                eventCortol.createDrawPointHandler(entity);
                break;
            case "polyline":
            case "polylineVolume"://线
                eventCortol.createDrawPolylineHandler(entity, control[type].getPositions(entity));
                break;
            case "polygon"://面
                eventCortol.createDrawPolygonHandler(entity, control[type].getPositions(entity));
                break;
            case "rectangle":
            case "extrudedRectangle":
            case "measureHeight"://两个点的对象
                eventCortol.createTwoPointsModelHandler(entity, control[type].getPositions(entity));
                break;
            case "wall"://墙
                var ePositions = control[type].getPositions(entity);
                var eMinimumHeights = control[type].getMinimumHeights(entity);
                var eMaximumHeights = control[type].getMaximumHeights(entity);
                eventCortol.createDrawWallHandler(entity, ePositions, eMinimumHeights, eMaximumHeights);
                break;
        } 
        extendEntity(entity);
        arrEntity.push(entity);

        entity.startDrawing();
        currentEntity = entity;

        return entity;
    }

    //停止编辑
    function stopDraw(noevent) {
        //释放上次未完成的绘制
        eventCortol.destroyDrawHandler();
        if (currentEntity && currentEntity.inProgress) {
            currentEntity.stopDrawing(noevent);
            dataSource.entities.remove(currentEntity);
            removeArrayOne(arrEntity, currentEntity);//arrEntity.remove(currentEntity);
        }

        //释放在编辑的对象
        if (currentEntity && currentEntity.stopEditing) {
            currentEntity.stopEditing(noevent);
            currentEntity = null;
        }
        return this;
    }

    //修改了属性
    function updateAttribute(attribute, entity) {
        if (entity != null)
            currentEntity = entity;

        if (currentEntity == null || attribute == null) return;
        //attribute.minMaxPoints = attribute.minMaxPoints || {};
        attribute.style = attribute.style || {};
        attribute.attr = attribute.attr || {};

        var type = currentEntity.attribute.type;
        control[type].attribute2Entity(attribute, currentEntity[type]);
        if (type == "model")
            control[type].attribute2Model(attribute, currentEntity);
        currentEntity.attribute = attribute;

        if (type == "ellipse" || type == "polygon" || type == "wall" || type == "rectangle") {
            currentEntity.editor.updateDraggers();
        }

        //名称 绑定到tooltip
        if (options.tooltip) {
            if (currentEntity.attribute.attr && currentEntity.attribute.attr.name) {
                currentEntity.tooltip = currentEntity.attribute.attr.name;
            } else {
                currentEntity.tooltip = null;
            }
        }  
        return currentEntity;
    }

    //修改坐标、高程
    function updateGeometry(positions, entity) {
        if (entity == null) entity = currentEntity;
        if (entity == null || positions == null) return;
        var type = entity.attribute.type;

        control[type].setPositions(entity, positions);

        if (entity.editor && entity.editor.destroy) {
            //entity.editor.updateDraggers();

            entity.editor.destroy();
            var type = entity.attribute.type;
            entity.editor = control[type].getEditor(dataSource, entity, {
                dragIcon: dragIcon
            });
        }

        return entity;
    }

    /**
	 * 扩展entity实体，绑定一些方法
	 */
    function extendEntity(entity) {
        //绘制开始、修改、结束
        entity.startDrawing = function () {
            $('.cesium-viewer').css('cursor', 'crosshair');

            var entity = this;
            if (options.onStartDrawing && typeof (options.onStartDrawing) == "function") {
                options.onStartDrawing(entity);
            }
        };
        entity.changeDrawing = function () {
            var entity = this;
            if (options.onChangeDrawing && typeof (options.onChangeDrawing) == "function") {
                options.onChangeDrawing(entity);
            }
        };
        entity.moveDrawing = function () {
            var entity = this;
            if (options.onMoveDrawing && typeof (options.onMoveDrawing) == "function") {
                options.onMoveDrawing(entity);
            }
        };
        entity.stopDrawing = function () {
            $('.cesium-viewer').css('cursor', '');

            var entity = this;
            if (options.onStopDrawing && typeof (options.onStopDrawing) == "function") {
                options.onStopDrawing(entity);
            }
        };

        //编辑开始、修改、结束
        entity.startEditing = function () {
            if (!_hasEdit) return;

            var entity = this;
            currentEntity = entity;

            //绑定编辑器
            if (entity.editor == null) {
                var type = entity.attribute.type;
                entity.editor = control[type].getEditor(dataSource, entity, {
                    dragIcon: dragIcon
                });
            }

            if (options.onStartEditing && typeof (options.onStartEditing) == "function") {
                options.onStartEditing(entity);
            }
        };

        entity.stopEditing = function (noevent) {
            var entity = this;

            //释放编辑器
            if (entity.editor) {
                entity.editor.destroy();
                entity.editor = null;
            }

            if (!noevent && options.onStopEditing && typeof (options.onStopEditing) == "function") {
                options.onStopEditing(entity);
            }
        };

        entity.changeEditing = function () {
            var entity = this;
            if (options.onChangeEditing && typeof (options.onChangeEditing) == "function") {
                options.onChangeEditing(entity);
            }
        };

        entity.updatePositions = function (positions) {
            var entity = this;
            var type = entity.attribute.type;
            if (type == "ellipse") {
                if (!entity.attribute.style.clampToGround) { 
                    var height = Cesium.Cartographic.fromCartesian(positions).height;
                    entity.attribute.style.height = Number(height.toFixed(2));
                    if (entity.ellipse.height)
                        entity.ellipse.height._value = entity.attribute.style.height;
                    else
                        entity.ellipse.height = entity.attribute.style.height;

                    if (entity.attribute.style.extrudedHeight) {
                        var extrudedHeight = Number(height) + Number(entity.attribute.style.extrudedHeight);
                        entity.ellipse.extrudedHeight._value = Number(extrudedHeight.toFixed(2));
                        entity.attribute.style.extrudedHeight = Number(extrudedHeight.toFixed(2));
                    }
                }
            }
            control[type].setPositions(currentEntity, positions);
        }
    };

    //删除单个
    function deleteEntity(entity) {
        if (entity == null) return;
        entity.stopEditing(true);

        removeArrayOne(arrEntity, entity); //arrEntity.remove(entity);

        dataSource.entities.remove(entity);
    }

    //删除当前entity
    function deleteCurrentEntity() {
        if (currentEntity) {
            currentEntity.stopEditing(true);
            removeArrayOne(arrEntity, currentEntity); //arrEntity.remove(currentEntity); 
            dataSource.entities.remove(currentEntity);
            currentEntity = null;
        }
    }

    //删除所有
    function deleteAll() {
        stopDraw();

        dataSource.entities.removeAll();
        arrEntity = [];
    }

    function setVisible(visible) {
        //if(visible)
        //    viewer.dataSources.add(dataSource);
        //else
        //    viewer.dataSources.remove(dataSource,false); 

        $(arrEntity).each(function (i, item) {
            if (visible) {
                if (!dataSource.entities.contains(item))
                    dataSource.entities.add(item);
            }
            else {
                if (dataSource.entities.contains(item))
                    dataSource.entities.remove(item);
            }
        });
    }

    //获取实体的经纬度值 坐标数组
    function getCoordinates(entity) {
        var type = entity.attribute.type;
        var positions = control[type].getCoordinates(entity);
        return positions;
    }

    //获取实体的坐标数组
    function getPositions(entity) {
        var type = entity.attribute.type;
        var positions = control[type].getPositions(entity);
        return positions;
    }

    function setPositions(entity, positions) {
        var type = entity.attribute.type;
        var positions = control[type].setPositions(entity, positions);
    }

    //是否存在绘制
    function hasDraw() {
        return arrEntity.length > 0;
    }

    //获取所有绘制的实体对象列表
    function getEntitys() {
        return arrEntity;
    }
    
    function getDataSource(){
        return dataSource;
    }

    function getEntityById(id) {
        for (var i = 0; i < arrEntity.length; i++) {
            var entity = arrEntity[i];
            if(id == entity.attribute.attr.id){
                return entity;
            }           
        }
        return null;
    }


    function getCurrentEntity() {
        return currentEntity;
    }
    
    //从plot的 标号默认值F12打印 拷贝，方便读取
    var configDefval = { "label": { "edittype": "label", "name": "文字", "style": { "text": "文字", "color": "#ffffff", "opacity": 1, "font_family": "楷体", "font_size": 30, "border": true, "border_color": "#000000", "border_width": 3, "background": false, "background_color": "#000000", "background_opacity": 0.5, "font_weight": "normal", "font_style": "normal", "scaleByDistance": false, "scaleByDistance_far": 1000000, "scaleByDistance_farValue": 0.1, "scaleByDistance_near": 1000, "scaleByDistance_nearValue": 1, "distanceDisplayCondition": false, "distanceDisplayCondition_far": 10000, "distanceDisplayCondition_near": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "point": { "edittype": "point", "name": "像素点", "style": { "pixelSize": 10, "color": "#3388ff", "opacity": 1, "outline": true, "outlineColor": "#ffffff", "outlineOpacity": 1, "outlineWidth": 2, "scaleByDistance": false, "scaleByDistance_far": 1000000, "scaleByDistance_farValue": 0.1, "scaleByDistance_near": 1000, "scaleByDistance_nearValue": 1, "distanceDisplayCondition": false, "distanceDisplayCondition_far": 10000, "distanceDisplayCondition_near": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "imagepoint": { "edittype": "imagepoint", "name": "图标点标记", "style": { "image": "", "opacity": 1, "scale": 1, "rotation": 0, "scaleByDistance": false, "scaleByDistance_far": 1000000, "scaleByDistance_farValue": 0.1, "scaleByDistance_near": 1000, "scaleByDistance_nearValue": 1, "distanceDisplayCondition": false, "distanceDisplayCondition_far": 10000, "distanceDisplayCondition_near": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "model": { "edittype": "model", "name": "模型", "style": { "modelUrl": "", "scale": 1, "heading": 0, "pitch": 0, "roll": 0, "fill": false, "color": "#3388ff", "opacity": 1, "silhouette": false, "silhouetteColor": "#ffffff", "silhouetteSize": 2, "silhouetteAlpha": 0.8 }, "attr": { "id": "", "name": "", "remark": "" } }, "polyline": { "edittype": "polyline", "name": "线", "position": { "minCount": 2 }, "style": { "lineType": "solid", "color": "#3388ff", "width": 4, "clampToGround": false, "outline": false, "outlineColor": "#ffffff", "outlineWidth": 2, "opacity": 1 }, "attr": { "id": "", "name": "", "remark": "" } }, "polylineVolume": { "edittype": "polylineVolume", "name": "管道线", "position": { "height": true, "minCount": 2 }, "style": { "color": "#00FF00", "radius": 10, "shape": "pipeline", "outline": false, "outlineColor": "#ffffff", "opacity": 1 }, "attr": { "id": "", "name": "", "remark": "" } }, "polygon": { "edittype": "polygon", "name": "面", "position": { "height": true, "minCount": 3 }, "style": { "color": "#3388ff", "opacity": 0.6, "outline": true, "outlineColor": "#ffffff", "outlineOpacity": 1, "clampToGround": false }, "attr": { "id": "", "name": "", "remark": "" } }, "polygon_clampToGround": { "edittype": "polygon_clampToGround", "name": "贴地面", "position": { "height": false, "minCount": 3 }, "style": { "color": "#ffff00", "opacity": 0.6, "outline": true, "outlineColor": "#ffffff", "outlineOpacity": 1, "clampToGround": true }, "attr": { "id": "", "name": "", "remark": "" } }, "extrudedPolygon": { "edittype": "extrudedPolygon", "name": "拉伸面", "position": { "height": true, "minCount": 3 }, "style": { "color": "#00FF00", "opacity": 0.6, "outline": true, "outlineColor": "#ffffff", "outlineOpacity": 1, "extrudedHeight": 100, "perPositionHeight": true }, "attr": { "id": "", "name": "", "remark": "" } }, "rectangle": { "edittype": "rectangle", "name": "矩形", "position": { "height": false, "minCount": 2, "maxCount": 2 }, "style": { "height": 0, "color": "#3388ff", "rotation": 0, "opacity": 0.6, "clampToGround": false }, "attr": { "id": "", "name": "", "remark": "" } }, "rectangle_clampToGround": { "edittype": "rectangle_clampToGround", "name": "贴地矩形", "position": { "height": false, "minCount": 2, "maxCount": 2 }, "style": { "color": "#ffff00", "rotation": 0, "opacity": 0.6, "clampToGround": true }, "attr": { "id": "", "name": "", "remark": "" } }, "rectangleImg": { "edittype": "rectangleImg", "name": "贴地图片", "position": { "height": false, "minCount": 2, "maxCount": 2 }, "style": { "image": "", "rotation": 0, "opacity": 1, "clampToGround": true }, "attr": { "id": "", "name": "", "remark": "" } }, "extrudedRectangle": { "edittype": "extrudedRectangle", "name": "拉伸矩形", "position": { "height": false, "minCount": 2, "maxCount": 2 }, "style": { "color": "#00FF00", "outline": true, "outlineColor": "#ffffff", "rotation": 0, "opacity": 0.6, "extrudedHeight": 40, "height": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "ellipse": { "edittype": "ellipse", "name": "椭圆", "position": { "height": false }, "style": { "semiMinorAxis": 500, "semiMajorAxis": 500, "height": 0, "opacity": 0.6, "fill": true, "color": "#3388ff", "outline": true, "outlineColor": "#ffffff", "rotation": 0, "clampToGround": false }, "attr": { "id": "", "name": "", "remark": "" } }, "ellipse_clampToGround": { "edittype": "ellipse_clampToGround", "name": "椭圆", "position": { "height": false }, "style": { "semiMinorAxis": 500, "semiMajorAxis": 500, "opacity": 0.6, "fill": true, "color": "#ffff00", "outline": true, "outlineColor": "#ffffff", "rotation": 0, "clampToGround": true }, "attr": { "id": "", "name": "", "remark": "" } }, "extrudedEllipse": { "edittype": "extrudedEllipse", "name": "圆柱体", "position": { "height": false }, "style": { "semiMinorAxis": 100, "semiMajorAxis": 100, "opacity": 0.6, "fill": true, "color": "#00FF00", "outline": true, "outlineColor": "#ffffff", "extrudedHeight": 100, "height": 0, "rotation": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "ellipsoid": { "edittype": "ellipsoid", "name": "球体", "style": { "extentRadii": 100, "widthRadii": 100, "heightRadii": 100, "color": "#00FF00", "outline": true, "outlineColor": "#ffffff", "fill": true, "opacity": 0.6 }, "attr": { "id": "", "name": "", "remark": "" } }, "wall": { "edittype": "wall", "name": "墙体", "position": { "height": true, "minCount": 2 }, "style": { "color": "#00FF00", "outline": true, "outlineColor": "#ffffff", "opacity": 0.6, "extrudedHeight": 40 }, "attr": { "id": "", "name": "", "remark": "" } } };


    //剔除与默认值相同的值
    function removeGeoJsonDefVal(geojson){ 
        if(!geojson.properties ||!geojson.properties.type )return geojson;
        
        var type = geojson.properties.edittype || geojson.properties.type;
        var def = configDefval[type];
        if(!def )return geojson;

        var newgeojson = _util.clone(geojson);
        if(geojson.properties.style){
            var newstyle = {};
            for (var i in geojson.properties.style) {
                var val = geojson.properties.style[i];
                if (val == null || val == "") continue;

                var valDef = def.style[i];
                if (valDef == val) continue; 
                newstyle[i] = val;
            }
            newgeojson.properties.style = newstyle;
        }
                
        if(geojson.properties.attr){
            var newattr = {};
            for (var i in geojson.properties.attr) {
                var val = geojson.properties.attr[i];
                if (val == null || val == "") continue;

                var valDef = def.attr[i];
                if (valDef == val) continue;
                     
                newattr[i] = val;
            }
            newgeojson.properties.attr = newattr;
        }

        return newgeojson;
    }

    function addPropertiesDefVal(properties){
        //赋默认值 
        var def = configDefval[properties.edittype || properties.type];
        if(def){ 
            properties.style = properties.style||{};
            for (var key in def.style) {
                var val = properties.style[key];
                if (val != null) continue;

                properties.style[key] = def.style[key];
            }

            properties.attr = properties.attr||{};
            for (var key in def.attr) {
                var val = properties.attr[key];
                if (val != null) continue;

                properties.attr[key] = def.attr[key];
            }
        }
        return properties;
    }

    //转换当前所有为geojson
    function toGeoJSON(entity) {
        if (entity == null) {//全部数据
            if (arrEntity.length == 0) return null;

            var features = [];
            for (var i = 0; i < arrEntity.length; i++) {
                var entity = arrEntity[i];

                var type = entity.attribute.type;
                var geojson = control[type].toGeoJSON(entity);
                geojson = removeGeoJsonDefVal(geojson);

                features.push(geojson);
            }
            var geojson = {
                type: "FeatureCollection",
                features: features
            };
            return geojson;
        } else {
            var type = entity.attribute.type;
            var geojson = control[type].toGeoJSON(entity);
            geojson = removeGeoJsonDefVal(geojson);
            return geojson;
        }
    }

    /**
     * 加载goejson数据
     * @param {Object} json geojson字符串
     * @param {Object} isClear 是否清空已有的模型
     */
    function jsonToEntity(json, isClear, isFly) {
        var jsonObjs = json;
        try {
            if (_util.isString(json))
                jsonObjs = JSON.parse(json);
        } catch (e) {
            haoutil.alert(e.name + ": " + e.message + " \n请确认json文件格式正确!!!");
            return;
        }

        if (isClear) {
            deleteAll();
        }
        var arrthis = [];
        var jsonFeatures = jsonObjs.features;
        for (var i = 0; i < jsonFeatures.length; i++) {
            var feature = jsonFeatures[i];

            if (!feature.properties || !feature.properties.type) {
                //非本身保存的外部其他geojson数据
                feature.properties = feature.properties || {}; 
                switch (feature.geometry.type) {
                    case "MultiPolygon":
                    case "Polygon":
                        feature.properties.type = "polygon";
                        break;
                    case "MultiLineString":
                    case "LineString":
                        feature.properties.type = "polyline";
                        break;
                    case "MultiPoint":
                    case "Point":
                        feature.properties.type = "point";
                        break;
                }

            }

            var type = feature.properties.type;
            if (control[type] == null) {
                throw '数据无法识别或者数据的[' + type + ']类型参数有误';
                return;
            }
            feature.properties.style= feature.properties.style||{};

            //赋默认值  
            feature.properties = addPropertiesDefVal(feature.properties);

            
            var entity = control[type].startDraw(dataSource, feature.properties);
            var positions = _drawutils.getPositionsFromJson(feature.geometry);
            control[type].setPositions(entity, positions);
            extendEntity(entity);

            //名称 绑定到tooltip
            if (options.tooltip) {
                if (entity.attribute.attr && entity.attribute.attr.name) {
                    entity.tooltip = entity.attribute.attr.name;
                } else {
                    entity.tooltip = null;
                }
            }

            arrEntity.push(entity);
            arrthis.push(entity);
        }

        if (isFly)
            viewer.flyTo(arrthis);

        return arrthis;
    }

 

    /**
     * 加载标记信息json文件，一数组的字符串Array<Object>，
     * @param {Object} json Arrray<Object> Object {id:"abcd",name:"abcd",x:"117.22",y:"31.22"}
     * @param {Object} style Object 标记的样式
     * @param {Object} isClear boolean 是否清空已有模型 
     */
    function markersInfoToEntity(json, style, isClear) {
        var arr = json;
        try {
            if (_util.isString(json))
                arr = JSON.parse(json);
        } catch (e) {
            haoutil.alert(e.name + ": " + e.message + " \n请确认json文件格式正确!!!");
            return;
        }

        if (!(arr instanceof Array)) {
            haoutil.alert("请确认json文件格式正确!!!");
            return;
        }
        if (isClear) {
            deleteAll();
        }

        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (!(item.x) || !(item.y)) {
                haoutil.alert(e.name + ": " + e.message + " \n请确认json文件格式正确!!!");
                return;
            }
            var attr = {
                id: item.id || item.ID || "",
                name: item.name || item.NAME || "",
                remark: item.remark || item.REMA || ""
            };
            var attribute = {
                type: style.type || "billboard",
                attr: attr,
                style: style.style
            };

            var markerPosition = Cesium.Cartesian3.fromDegrees(item.x, item.y, item.z || 0.0);
            var entity = control[attribute.type].startDraw(dataSource, attribute);
            control[attribute.type].setPositions(entity, markerPosition);
            extendEntity(entity);
            arrEntity.push(entity);
        }

        return arrEntity;
    }

    //删除数组的1个
    function removeArrayOne(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                arr.splice(i, 1);
                break;
            }
        }
    };


    return {
        startDraw: startDraw,
        stopDraw: stopDraw,
        updateAttribute: updateAttribute,
        updateGeometry: updateGeometry,
        toGeoJSON: toGeoJSON,
        jsonToEntity: jsonToEntity,
        markersInfoToEntity: markersInfoToEntity,
        deleteEntity: deleteEntity,
        deleteCurrentEntity: deleteCurrentEntity,
        deleteAll: deleteAll,
        setVisible: setVisible,
        hasDraw: hasDraw,
        hasEdit: hasEdit,
        getEntitys: getEntitys,
        getDataSource:getDataSource,
        getEntityById:getEntityById,
        getCurrentEntity: getCurrentEntity,
        getCoordinates: getCoordinates,
        getPositions: getPositions,
        setPositions: setPositions
    };
});

export default Draw2;