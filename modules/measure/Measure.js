import { Cesium } from '@dc-modules/namespace'
import { Draw2 as _Draw } from '../draw';

var Measure = (function (opts) {

    var viewer = opts.viewer;
    // console.log(viewer)
    //显示测量结果文本的字体
    var _labelAttr =  { 
        "color": "#ffffff", 
        "font_family": "楷体",
        "font_size": 23,
        "border": true,
        "border_color": "#000000",
        "border_width": 3,
        "background": true,
        "background_color": "#000000",
        "background_opacity": 0.5, 
        "scaleByDistance": true,
        "scaleByDistance_far": 800000,
        "scaleByDistance_farValue": 0.3,
        "scaleByDistance_near": 1000,
        "scaleByDistance_nearValue": 1 , 
        "pixelOffset": [0, -15]
    };
    if(opts.label){ 
        for(var key in opts.label){
            _labelAttr[key] = opts.label[key];
        }
    }

    console.log(_Draw)
    var thisType = "";//当前正在绘制的类别 
    var drawControl = new _Draw({
        viewer: viewer,
        hasEdit: false,
        onChangeDrawing: function (entity) {
            switch (thisType) {
                case "length":
                case "section":
                    workLength.showAddPointLength(entity);
                    break;
                case "area":
                    workArea.showAddPointLength(entity);
                    break;
                case "height":
                    workHeight.showAddPointLength(entity);
                    break;
                case "super_height":
                    workSuperHeight.showAddPointLength(entity);
                    break;
                case "angle":
                    workAngle.showAddPointLength(entity);
                    break;
                    
            }
        },
        onMoveDrawing: function (entity) {
            switch (thisType) {
                case "length":
                case "section":
                    workLength.showMoveDrawing(entity);
                    break;
                case "area":
                    workArea.showMoveDrawing(entity);
                    break;
                case "height":
                    workHeight.showMoveDrawing(entity);
                    break;
                case "super_height":
                    workSuperHeight.showMoveDrawing(entity);
                    break;
                case "angle": 
                    workAngle.showMoveDrawing(entity);
                    break;
            }
        },
        onStopDrawing: function (entity) {
            switch (thisType) {
                case "length":
                case "section":
                    workLength.showDrawEnd(entity);
                    break;
                case "area":
                    workArea.showDrawEnd(entity);
                    break;
                case "height":
                    workHeight.showDrawEnd(entity);
                    break;
                case "super_height":
                    workSuperHeight.showDrawEnd(entity);
                    break;
                case "angle": 
                    workAngle.showDrawEnd(entity);
                    break;
            }
        }
    });
    console.log(dataSource)
    var dataSource = drawControl.getDataSource();

    /*长度测量*/
    function measuerLength(options) {
        endLastDraw();

        thisType = "length";
        options = options || {};
        options.type = thisType;
        if (!options.hasOwnProperty("terrain")) options.terrain = true;

        workLength.start(options);
    }

    /*剖面分析*/
    function measureSection(options) {
        endLastDraw();

        thisType = "section";
        options = options || {};
        options.type = thisType;
        options.terrain = true;

        workLength.start(options);
    }


    /*面积测量*/
    function measureArea(options) {
        endLastDraw();

        thisType = "area";
        options = options || {};
        options.type = thisType;

        workArea.start(options);
    };

    /*高度测量*/
    function measureHeight(options) {
        endLastDraw();

        options = options || {};

        if (options.hasOwnProperty("isSuper") && !options.isSuper) {
            thisType = "height";
            options.type = thisType;
            workHeight.start(options);
        }
        else {
            thisType = "super_height";
            options.type = thisType;
            workSuperHeight.start(options);
        }
    };


    /*角度测量*/
    function measureAngle(options) {
        endLastDraw();

        thisType = "angle";
        options = options || {};
        options.type = thisType;

        workAngle.start(options);
    };

    


    //如果上次未完成绘制就单击了新的，清除之前未完成的。
    function endLastDraw() {
        workLength.clearLastNoEnd();
        workArea.clearLastNoEnd();
        workHeight.clearLastNoEnd();
        workSuperHeight.clearLastNoEnd();
        workAngle.clearLastNoEnd();

        drawControl.stopDraw();
    }


    /*清除测量*/
    function clearMeasure() {
        thisType = "";
        endLastDraw();
         
        //dataSource.entities.removeAll();
        drawControl.deleteAll();
    };


    /** 更新量测结果的单位  */
    function updateUnit(thisType, unit) {
        var arr = dataSource.entities.values;
        for (var i in arr) {
            var entity = arr[i];
            if (entity.label && entity.isMarsMeasureLabel && entity.attribute && entity.attribute.value) {
                if (entity.attribute.type != thisType) continue;
                if (thisType == "area") {
                    entity.label.text._value = (entity.attribute.textEx || "") + formatArea(entity.attribute.value, unit);
                }
                else {
                    entity._label.text._value = (entity.attribute.textEx || "") + formatLength(entity.attribute.value, unit);
                }
            }
        }
    }



    var workLength = {
        options: null,
        arrLables: [],      //各线段label
        totalLable: null,   //总长label 
        //清除未完成的数据
        clearLastNoEnd: function () {
            if (this.totalLable != null)
                dataSource.entities.remove(this.totalLable);
            if (this.arrLables && this.arrLables.length > 0) {
                var arrLables = this.arrLables;
                if (arrLables && arrLables.length > 0) {
                    for (var i in arrLables) {
                        dataSource.entities.remove(arrLables[i]);
                    }
                }
            }
            this.totalLable = null;
            this.arrLables = [];
        },
        //开始绘制
        start: function (options) {
            this.options = options;

            //总长label 
            var entityattr =  _LabelControl.attribute2Entity({style:_labelAttr},{
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  
                show: false
            });  

            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type,
                }
            });
            this.arrLables = [];

     
            drawControl.startDraw({
                type: "polyline",
                addHeight: options.addHeight,
                style: options.style||{
                    "lineType": "glow",
                    "color": "#ebe12c",
                    "width": 9,
                    "glowPower": 0.1,
                    "clampToGround":(this.options.type == "section"||this.options.terrain),//是否贴地 
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function (entity) {
            var positions = drawControl.getPositions(entity);

            var entityattr =  _LabelControl.attribute2Entity({style:_labelAttr},{
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  
                show: true
            });

            var tempSingleLabel = dataSource.entities.add({
                position: positions[positions.length - 1],
                label:entityattr,
                isMarsMeasureLabel: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type,
                }
            });

            if (positions.length == 1) {
                tempSingleLabel.label.text = "起点";
                //tempSingleLabel.attribute.value = 0;
            }
            else {
                var distance = this.getLength(positions);
                var distancestr = formatLength(distance, this.options.unit);

                tempSingleLabel.label.text = distancestr;
                tempSingleLabel.attribute.value = distance;

                //屏蔽比较小的数值
                if (this.getLength([positions[positions.length - 2], positions[positions.length - 1]]) < 5)
                    tempSingleLabel.show = false;
            }
            this.arrLables.push(tempSingleLabel);
        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function (entity) {
            var positions = drawControl.getPositions(entity);
            if (positions.length < 2) return;

            var distance = this.getLength(positions);
            var distancestr = formatLength(distance, this.options.unit);

            this.totalLable.position = positions[positions.length - 1];
            this.totalLable.label.text = "总长:" + distancestr;
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = distance;
            this.totalLable.attribute.textEx = "总长:";

            if (this.options.calback)
                this.options.calback(distancestr, distance);
        },
        //绘制完成后
        showDrawEnd: function (entity) {
            var positions = drawControl.getPositions(entity);
            var count = this.arrLables.length - positions.length;
            if (count >= 0) {
                for (var i = this.arrLables.length - 1; i >= positions.length - 1; i--) {
                    dataSource.entities.remove(this.arrLables[i]);
                }
                this.arrLables.splice(positions.length - 1, count + 1);
            }
            entity._totalLable = this.totalLable;
            entity._arrLables = this.arrLables;

            this.totalLable = null;
            this.arrLables = [];

            if (entity.polyline == null) return;

            if (this.options.type == "section")
                this.updateSectionForTerrain(entity);
            else if (this.options.terrain)
                this.updateLengthForTerrain(entity);
        
        },
        //计算贴地线
        updateLengthForTerrain: function (entity) { 
            var that = this;
            var positions = entity.polyline.positions.getValue();
            var arrLables = entity._arrLables;
            var totalLable = entity._totalLable;
            var unit = totalLable && totalLable.unit;

            var index = 0;
            var positionsNew = [];

            function getLineFD() {
                index++;

                var arr = [positions[index - 1], positions[index]];
                _util.terrainPolyline({
                    viewer: viewer,
                    positions: arr,
                    calback: function (raisedPositions, noHeight) {
                        if (noHeight) {
                            if (index == 1)
                                positionsNew = positionsNew.concat(arr);
                            else
                                positionsNew = positionsNew.concat([positions[index]]);
                        }
                        else {
                            positionsNew = positionsNew.concat(raisedPositions);
                        }

                        if (index >= positions.length - 1) {
                            entity.polyline.positions.setValue(positionsNew);
                            if (totalLable) {
                                var distance = that.getLength(positionsNew);
                                var distancestr = formatLength(distance, unit);

                                totalLable.label.text = "总长:" + distancestr;
                                totalLable.attribute.value = distance;

                                if (that.options.calback)
                                    that.options.calback(distancestr, distance);
                            }
                        }
                        else {
                            var distance = that.getLength(raisedPositions);
                            var distancestr = formatLength(distance, unit);

                            var thisLabel = arrLables[index];
                            thisLabel.label.text = distancestr;
                            thisLabel.attribute.value = distance;

                            getLineFD();
                        }
                    }
                });
            }
            getLineFD();
        },

        //计算剖面
        updateSectionForTerrain: function (entity) { 
            var positions = entity.polyline.positions.getValue();
            if (positions.length < 2) return;

            var arrLables = entity._arrLables;
            var totalLable = entity._totalLable;
            var unit = totalLable && totalLable.unit;

            var index = 0;
            var positionsNew = [];

            var alllen = 0;
            var arrLen = [];
            var arrHB = [];
            var arrLX = [];
            var arrPoint = [];


            var that = this;
            function getLineFD() {
                index++;

                var arr = [positions[index - 1], positions[index]];
                _util.terrainPolyline({
                    viewer: viewer,
                    positions: arr,
                    calback: function (raisedPositions, noHeight) {
                        if (noHeight) {
                            if (index == 1)
                                positionsNew = positionsNew.concat(arr);
                            else
                                positionsNew = positionsNew.concat([positions[index]]);
                        }
                        else {
                            positionsNew = positionsNew.concat(raisedPositions);
                        }

                        var h1 = Cesium.Cartographic.fromCartesian(positions[index - 1]).height;
                        var h2 = Cesium.Cartographic.fromCartesian(positions[index]).height;
                        var hstep = (h2 - h1) / raisedPositions.length;

                        for (var i = 0; i < raisedPositions.length; i++) {
                            //长度
                            if (i != 0) {
                                alllen += Cesium.Cartesian3.distance(raisedPositions[i], raisedPositions[i - 1]);
                            }
                            arrLen.push(Number(alllen.toFixed(1)));

                            //海拔高度
                            var point = _latlng.formatPositon(raisedPositions[i]);
                            arrHB.push(point.z);
                            arrPoint.push(point);

                            //路线高度
                            var fxgd = Number((h1 + hstep * i).toFixed(1));
                            arrLX.push(fxgd);
                        }


                        if (index >= positions.length - 1) {
                            if (totalLable) {
                                var distance = that.getLength(positionsNew);
                                var distancestr = formatLength(distance, unit);

                                totalLable.label.text = "总长:" + distancestr;
                                totalLable.attribute.value = distance;
                            }
                            if (that.options.calback)
                                that.options.calback({
                                    distancestr: distancestr,
                                    distance: distance,
                                    arrLen: arrLen,
                                    arrLX: arrLX,
                                    arrHB: arrHB,
                                    arrPoint: arrPoint,
                                });
                        }
                        else {
                            var distance = that.getLength(raisedPositions);
                            var distancestr = formatLength(distance, unit);

                            var thisLabel = arrLables[index];
                            thisLabel.label.text = distancestr;
                            thisLabel.attribute.value = distance;

                            getLineFD();
                        }
                    }
                });
            }
            getLineFD();
        },
        //计算长度，单位：米
        getLength: function (positions) {
            var distance = 0;
            for (var i = 0, len = positions.length - 1; i < len; i++) {
                distance += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
            }
            return distance;
        }
    };


    var workArea = {
        options: null,
        totalLable: null,  //面积label
        //清除未完成的数据
        clearLastNoEnd: function () {
            if (this.totalLable != null)
                dataSource.entities.remove(this.totalLable);
            this.totalLable = null;
        },
        //开始绘制
        start: function (options) {
            this.options = options;

            var entityattr =  _LabelControl.attribute2Entity({style:_labelAttr},{
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  
                show: false
            }); 

            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type,
                }
            });

            drawControl.startDraw({
                type: "polygon",
                style: options.style||{
                    color: "#00fff2",
                    outline: true,
                    outlineColor: "#fafa5a",
                    outlineWidth: 4,
                    opacity: 0.4,
                    clampToGround: true //贴地
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function (entity) {

        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function (entity) {
            var positions = drawControl.getPositions(entity);
            if (positions.length < 3) return;
            
            var _PolygonControl = __webpack_require__(7).default  
            var polygon = _PolygonControl.toGeoJSON(entity);
            var area = turf.area(polygon);
            var areastr = formatArea(area, this.options.unit);

            //求中心点 
            var center = turf.centerOfMass(polygon);
            var maxHeight = _drawutils.getMaxHeightForPositions(positions);
            var ptcenter = Cesium.Cartesian3.fromDegrees(
                center.geometry.coordinates[0],
                center.geometry.coordinates[1],
                maxHeight + 1);

            this.totalLable.position = ptcenter;
            this.totalLable.label.text = "面积:" + areastr;
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = area;
            this.totalLable.attribute.textEx = "面积:";

            if (this.options.calback)
                this.options.calback(areastr, area);
        },
        //绘制完成后
        showDrawEnd: function (entity) {
            if (entity.polygon == null) return;

            var polyPositions = entity.polygon.hierarchy.getValue();
            $.each(polyPositions, function (i, val) {
                val.z = val.z + 1; //最后的高程加1，以确保端点显示在模型上面
            });

            entity._totalLable = this.totalLable;
            this.totalLable = null;
        },
    };


    var workHeight = {
        options: null,
        totalLable: null,   //高度label  
        //清除未完成的数据
        clearLastNoEnd: function () {
            if (this.totalLable != null)
                dataSource.entities.remove(this.totalLable);
            this.totalLable = null;
        },
        //开始绘制
        start: function (options) {
            this.options = options;

            var entityattr =  _LabelControl.attribute2Entity({style:_labelAttr},{
                horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  
                show: false
            }); 

            this.totalLable = dataSource.entities.add({
                label:entityattr,
                isMarsMeasureLabel: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type,
                }
            });

            drawControl.startDraw({
                type: "polyline",
                minMaxPoints: { min: 2, max: 2, isSuper: false },
                style: options.style||{
                    "lineType": "glow",
                    "color": "#ebe12c",
                    "width": 9,
                    "glowPower": 0.1,
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function (entity) {


        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function (entity) {
            var positions = drawControl.getPositions(entity);
            if (positions.length < 2) return;

            var cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
            var cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
            var height = Math.abs(cartographic1.height - cartographic.height);
            var heightstr = formatLength(height, this.options.unit);

            this.totalLable.position = _drawutils.getMidPosition(positions[0], positions[1]);
            this.totalLable.label.text = "高度差:" + heightstr;
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = height;
            this.totalLable.attribute.textEx = "高度差:";

            if (this.options.calback)
                this.options.calback(heightstr, height);
        },
        //绘制完成后
        showDrawEnd: function (entity) {
            entity._totalLable = this.totalLable;
            this.totalLable = null;

        }
    };


    var workSuperHeight = {
        options: null,
        totalLable: null,   //高度差label
        xLable: null,       //水平距离label
        hLable: null,       //水平距离label
        //清除未完成的数据
        clearLastNoEnd: function () {
            if (this.totalLable != null)
                dataSource.entities.remove(this.totalLable);
            if (this.xLable != null)
                dataSource.entities.remove(this.xLable);
            if (this.hLable != null)
                dataSource.entities.remove(this.hLable);

            this.totalLable = null;
            this.xLable = null;
            this.hLable = null;
        },
        //开始绘制
        start: function (options) {
            this.options = options;
             
            var entityattr =  _LabelControl.attribute2Entity({style:_labelAttr},{
                horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,  
                show: false
            });   
            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type,
                }
            });

            var entityattr2 =  _LabelControl.attribute2Entity({style:_labelAttr},{
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  
                show: false
            });    
            entityattr2.pixelOffset = new Cesium.Cartesian2(0,0);
            this.xLable = dataSource.entities.add({
                label:entityattr2,
                isMarsMeasureLabel: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type,
                }
            });
             
            this.hLable = dataSource.entities.add({
                label:entityattr2,
                isMarsMeasureLabel: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type,
                }
            });

            drawControl.startDraw({
                type: "polyline",
                minMaxPoints: { min: 2, max: 2, isSuper: true },
                style: options.style||{
                    "lineType": "glow",
                    "color": "#ebe12c",
                    "width": 9,
                    "glowPower": 0.1,
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function (entity) {
            var lonlats = drawControl.getPositions(entity);
            if (lonlats.length == 4) {
                var mouseEndPosition = lonlats[3].clone();
                lonlats.pop();
                lonlats.pop();
                lonlats.pop();
                lonlats.push(mouseEndPosition);
            }

            if (lonlats.length == 2) {
                var zCartesian = _drawutils.getZHeightPosition(lonlats[0], lonlats[1])
                var hDistance = _drawutils.getHDistance(lonlats[0], lonlats[1]);
                if (hDistance > 3.0) {
                    lonlats.push(zCartesian);
                    lonlats.push(lonlats[0]);
                }
            }

            this.showSuperHeight(lonlats);
        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function (entity) {
            var lonlats = drawControl.getPositions(entity);
            if (lonlats.length == 4) {
                var mouseEndPosition = lonlats[3].clone();
                lonlats.pop();
                lonlats.pop();
                lonlats.pop();
                lonlats.push(mouseEndPosition);
            }

            if (lonlats.length == 2) {
                var zCartesian = _drawutils.getZHeightPosition(lonlats[0], lonlats[1])
                var hDistance = _drawutils.getHDistance(lonlats[0], lonlats[1]);
                if (hDistance > 3.0) {
                    lonlats.push(zCartesian);
                    lonlats.push(lonlats[0]);
                }
            }
            this.showSuperHeight(lonlats);
        },
        //绘制完成后
        showDrawEnd: function (entity) {
            entity._arrLables = [
                this.totalLable,
                this.hLable,
                this.xLable
            ];

            this.totalLable = null;
            this.hLable = null;
            this.xLable = null;
        },

        /**
         * 超级 高程测量
         * 由4个点形成的三角形（首尾点相同），计算该三角形三条线段的长度
         * @param {Array} positions 4个点形成的点数组
         */
        showSuperHeight: function (positions) {
            var vLength; //垂直距离
            var hLength; //水平距离
            var lLength; //长度
            var height;
            if (positions.length == 4) {
                var midLPoint = _drawutils.getMidPosition(positions[0], positions[1]);
                var midXPoint, midHPoint;
                var cartographic0 = Cesium.Cartographic.fromCartesian(positions[0]);
                var cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
                var cartographic2 = Cesium.Cartographic.fromCartesian(positions[2]);
                var tempHeight = cartographic1.height - cartographic2.height;
                height = cartographic1.height - cartographic0.height;
                lLength = Cesium.Cartesian3.distance(positions[0], positions[1]);
                if (height > -1 && height < 1) {
                    midHPoint = positions[1];
                    this.updateSuperHeightLabel(this.totalLable, midHPoint, "高度差:", height);
                    this.updateSuperHeightLabel(this.hLable, midLPoint, "", lLength);
                } else {
                    if (tempHeight > -0.1 && tempHeight < 0.1) {
                        midXPoint = _drawutils.getMidPosition(positions[2], positions[1]);
                        midHPoint = _drawutils.getMidPosition(positions[2], positions[3]);
                        hLength = Cesium.Cartesian3.distance(positions[1], positions[2]);
                        vLength = Cesium.Cartesian3.distance(positions[3], positions[2]);
                    } else {
                        midHPoint = _drawutils.getMidPosition(positions[2], positions[1]);
                        midXPoint = _drawutils.getMidPosition(positions[2], positions[3]);
                        hLength = Cesium.Cartesian3.distance(positions[3], positions[2]);
                        vLength = Cesium.Cartesian3.distance(positions[1], positions[2]);
                    }
                    this.updateSuperHeightLabel(this.totalLable, midHPoint, "高度差:", vLength);
                    this.updateSuperHeightLabel(this.xLable, midXPoint, "", hLength);
                    this.updateSuperHeightLabel(this.hLable, midLPoint, "", lLength);
                }
            } else if (positions.length == 2) {
                vLength = Cesium.Cartesian3.distance(positions[1], positions[0]);
                var midHPoint = _drawutils.getMidPosition(positions[0], positions[1]);
                if (xLable.label.show) {
                    xLable.label.show = false;
                    hLable.label.show = false;
                }
                this.updateSuperHeightLabel(this.totalLable, midHPoint, "高度差:", vLength);
            }

            var heightstr = formatLength(vLength, this.options.unit);
            if (this.options.calback)
                this.options.calback(heightstr, vLength);
        },
        /**
         * 超级 高程测量 显示标签
         * @param {Cesium.Label} currentLabel 显示标签
         * @param {Cesium.Cartesian3} postion 坐标位置
         * @param {String} type 类型("高度差"，"水平距离"，"长度")
         * @param {Object} value 值
         */
        updateSuperHeightLabel: function (currentLabel, postion, type, value) {
            if (currentLabel == null) return;

            currentLabel.position = postion;
            currentLabel.label.text = type+ formatLength(value, this.options.unit);
            currentLabel.label.show = true;

            currentLabel.attribute.value = value;
            currentLabel.attribute.textEx = type;
        }

    };



    
    var workAngle = {
        options: null,
        totalLable: null,   //角度label  
        exLine:null, //辅助线
        //清除未完成的数据
        clearLastNoEnd: function () {
            if (this.totalLable != null)
                dataSource.entities.remove(this.totalLable);
            this.totalLable = null;

            if (this.exLine != null)
                dataSource.entities.remove(this.exLine);
            this.exLine = null; 
        },
        //开始绘制
        start: function (options) {
            this.options = options;

             
            var entityattr =  _LabelControl.attribute2Entity({style:_labelAttr},{
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,  
                show: false
            });
             
            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type,
                }
            });
             
            drawControl.startDraw({
                type: "polyline",
                minMaxPoints: { min: 2, max: 2},
                style: options.style||{ 
                    "lineType": "arrow",
                    "color": "#ebe967",
                    "width": 9,
                    "clampToGround": true
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function (entity) {


        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function (entity) {
            var positions = drawControl.getPositions(entity);
            if (positions.length < 2) return;
             
            var len = Cesium.Cartesian3.distance(positions[0], positions[1]);

            //求方位角
            var point1 = _latlng.formatPositon(positions[0]);
            var point2 = _latlng.formatPositon(positions[1]);
    
            var pt1 = turf.point([point1.x,point1.y,point1.z]);
            var pt2 = turf.point([point2.x,point2.y,point2.z]); 
            var bearing = Math.round( turf.rhumbBearing(pt1, pt2));
            

            //求参考点
            var newpoint = turf.destination(pt1, len / 3000, 0, { units: 'kilometers' });//1/3
            newpoint = { x: newpoint.geometry.coordinates[0], y: newpoint.geometry.coordinates[1], z: point1.z };
            var new_position = Cesium.Cartesian3.fromDegrees(newpoint.x, newpoint.y, newpoint.z);
             
            this.updateExLine([positions[0],new_position]);//参考线
         

            this.totalLable.position = positions[1];
            this.totalLable.label.text = "角度:" + bearing + "°\n距离:" + formatLength(len);
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = bearing;
            this.totalLable.attribute.textEx = "角度:";

            if (this.options.calback)
                this.options.calback(bearing+'°', bearing);
        },
        updateExLine:function(positions){ 
            if(this.exLine){
                this.exLine.polyline.positions.setValue(positions);
            }else{
                this.exLine = dataSource.entities.add({
                    polyline: {
                        positions: positions,
                        width: 3,
                        clampToGround: true,
                        material:  new Cesium.PolylineDashMaterialProperty({
                            color: Cesium.Color.RED
                        })
                    }
                }); 
            }
        },
        //绘制完成后
        showDrawEnd: function (entity) {
            entity._totalLable = this.totalLable;
            this.totalLable = null;
            this.exLine = null;
        } 
     
    };



    /**  进行单位换算，格式化显示面积    */
    function formatArea(val, unit) {
        if (val == null) return "";

        if (unit == null || unit == "auto") {
            if (val < 1000000)
                unit = "m";
            else
                unit = "km";
        }

        var valstr = "";
        switch (unit) {
            default:
            case "m":
                valstr = val.toFixed(2) + '平方米';
                break;
            case "km":
                valstr = (val / 1000000).toFixed(2) + '平方公里';
                break;
            case "mu":
                valstr = (val * 0.0015).toFixed(2) + '亩';
                break;
            case "ha":
                valstr = (val * 0.0001).toFixed(2) + '公顷';
                break;
        }

        return valstr;
    }

    /**  单位换算，格式化显示长度     */
    function formatLength(val, unit) {
        if (val == null) return "";

        if (unit == null || unit == "auto") {
            if (val < 1000)
                unit = "m";
            else
                unit = "km";
        }

        var valstr = "";
        switch (unit) {
            default:
            case "m":
                valstr = val.toFixed(2) + '米';
                break;
            case "km":
                valstr = (val * 0.001).toFixed(2) + '公里';
                break;
            case "mile":
                valstr = (val * 0.00054).toFixed(2) + '海里';
                break;
            case "zhang":
                valstr = (val * 0.3).toFixed(2) + '丈';
                break;
        }
        return valstr;
    }



    return {
        measuerLength: measuerLength,
        measureHeight: measureHeight,
        measureArea: measureArea,
        measureSection: measureSection,
        measureAngle:measureAngle,
        updateUnit: updateUnit,
        clearMeasure: clearMeasure,

        formatArea: formatArea,
        formatLength: formatLength,
    };
});

export default Measure;