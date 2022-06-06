
/**
 * 创建一个编辑器，用于管理查看器的整体绘图和编辑功能。
 */
 var EventControl = function (viewer) {
    this.viewer = viewer;

};

EventControl.prototype.setCursor = function (style) {
    $("#" + this.viewer._container.id).css('cursor', style || '');
}
/**
  * 【绘制】单个坐标点的对象（点、字）绘制处理程序，绑定单击事件 
  */
EventControl.prototype.createDrawPointHandler = function (entity) {
    this.setCursor('crosshair');

    var that = this;
    entity.inProgress = true;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(function (event) {
        var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.position, entity);
        if (cartesian) {
            that.setCursor();

            entity.updatePositions(cartesian);
            entity.inProgress = false;
            entity.stopDrawing();
            entity.startEditing();
            handler.destroy();
            that.drawHandler = null;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //记录最近一次值 
    this.drawHandler = handler;
    return handler;
};

/**
 * 【绘制】多个坐标点的对象（线）绘制处理程序，绑定单击、鼠标移动、双击事件
 * Creates a handler that lets you modify a list of positions.
 */
EventControl.prototype.createDrawPolylineHandler = function (entity, positions) {
    this.setCursor('crosshair');
    var that = this;

    entity.inProgress = true;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    // Adds a point to the positions list.
    handler.lastPointTemporary = false;
    handler.setInputAction(function (event) {
        var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.position, entity);
        if (cartesian) {
            if (handler.lastPointTemporary) {
                positions.pop();
            }
            if (entity.attribute && entity.attribute.addHeight) //在绘制点基础自动增加高度
                cartesian = _drawutils.getPositionsWithHeight(cartesian, entity.attribute.addHeight);

            //test
            //var cartoLoc = Cesium.Cartographic.fromCartesian(cartesian);
            //cartesian._height= cartoLoc.height;
            //console.log('当前点高度：' + cartoLoc.height);

            //var str = "";
            //for (var i = 0; i < positions.length; i++) {
            //    str += Cesium.Cartographic.fromCartesian(positions[i]).height+",";
            //}
            //console.log('数组高度：' + str);
            

            positions.push(cartesian);

            handler.lastPointTemporary = false;
            if (entity.attribute && entity.attribute.minMaxPoints) {
                if ((positions.length == entity.attribute.minMaxPoints.min &&
            		positions.length == entity.attribute.minMaxPoints.max) ||
            		(entity.attribute.minMaxPoints.isSuper && positions.length == 4)) {
                    entity.inProgress = false;
                    handler.destroy();
                    that.drawHandler = null;
                    entity.stopDrawing();
                    entity.startEditing();
                    that.setCursor();
                }

            }
            entity.changeDrawing();
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Replaces the last point in the list with the point under the mouse.
    handler.setInputAction(function (event) {
        if (event.endPosition) {
            var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.endPosition, entity);
            if (cartesian) {
                if (handler.lastPointTemporary) {
                    positions.pop();
                }
                positions.push(cartesian);
                handler.lastPointTemporary = true;
                entity.moveDrawing();
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function (event) {
        entity.inProgress = false;
        handler.destroy();
        that.drawHandler = null;

        positions.pop();//必要代码 消除双击带来的多余经纬度 

        entity.stopDrawing();
        entity.startEditing();
        that.setCursor();

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    //记录最近一次值 
    this.drawHandler = handler;

    return handler;
};

/**
 * 【绘制】面绘制处理程序，绑定单击、鼠标移动、双击事件
 * Creates a handler that lets you modify a list of positions.
 */
EventControl.prototype.createDrawPolygonHandler = function (entity, positions) {
    this.setCursor('crosshair');
    var that = this;

    entity.inProgress = true;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    // Adds a point to the positions list.
    handler.lastPointTemporary = false;
    handler.setInputAction(function (event) {
        var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.position, entity);
        if (cartesian) {
            if (handler.lastPointTemporary) {
                positions.pop();
            }
            positions.push(cartesian);

            if (entity.attribute.style.extrudedHeight) {
                //存在extrudedHeight高度设置时
                var maxHight = _drawutils.getMaxHeightForPositions(positions);
                entity.polygon.extrudedHeight = maxHight + Number(entity.attribute.style.extrudedHeight);
            }

            handler.lastPointTemporary = false;
            entity.changeDrawing();
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Replaces the last point in the list with the point under the mouse.
    handler.setInputAction(function (event) {
        if (event.endPosition) {
            var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.endPosition, entity);
            if (cartesian) {
                if (handler.lastPointTemporary) {
                    positions.pop();
                }
                positions.push(cartesian);

                if (entity.attribute.style.extrudedHeight) {
                    //存在extrudedHeight高度设置时
                    var maxHight = _drawutils.getMaxHeightForPositions(positions);
                    entity.polygon.extrudedHeight = maxHight + Number(entity.attribute.style.extrudedHeight);
                }

                handler.lastPointTemporary = true;
                entity.moveDrawing();
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function (event) {
        entity.inProgress = false;
        handler.destroy();
        that.drawHandler = null;

        positions.pop();//必要代码 消除双击带来的多余经纬度 

        entity.stopDrawing();
        entity.startEditing();
        that.setCursor();

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    //记录最近一次值 
    this.drawHandler = handler;

    return handler;
};

/**
 * 【绘制】Cesium矩形，绑定单击、鼠标移动、双击事件;
 * Creates a handler that lets you modify a list of positions.
 */
EventControl.prototype.createTwoPointsModelHandler = function (entity, coordinates) {
    this.setCursor('crosshair');
    var that = this;
    entity.inProgress = true;
    var positions = [];
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.lastPointTemporary = false;
    handler.setInputAction(function (event) {
        var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.position, entity);
        if (cartesian) {
            if (handler.lastPointTemporary) {
                positions.pop();
            }
            positions.push(cartesian);
            if (positions.length == 1 && !entity.attribute.style.clampToGround) {
                var modelHeight = Number(Cesium.Cartographic.fromCartesian(cartesian).height.toFixed(2));
                entity.rectangle.height = modelHeight;
                entity.attribute.style.height = modelHeight;

                if (entity.attribute.style.extrudedHeight)
                    entity.rectangle.extrudedHeight = modelHeight + Number(entity.attribute.style.extrudedHeight);
            }

            if (positions.length == 2) {
                var coord = Cesium.Rectangle.fromCartesianArray(positions);
                coordinates.setValue(coord);
            }
            handler.lastPointTemporary = false;
            entity.changeDrawing();

            if (positions.length == 2) {
                entity.inProgress = false;
                handler.destroy();
                that.drawHandler = null;
                //positions.pop();//必要代码 消除双击带来的多余经纬度 

                entity.stopDrawing();
                entity.startEditing();
                that.setCursor();
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Replaces the last point in the list with the point under the mouse.
    handler.setInputAction(function (event) {
        if (event.endPosition) {
            var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.endPosition, entity);
            if (cartesian) {
                if (handler.lastPointTemporary) {
                    positions.pop();
                }
                positions.push(cartesian);
                if (positions.length == 2) {
                    var coord = Cesium.Rectangle.fromCartesianArray(positions);
                    coordinates.setValue(coord);
                }
                handler.lastPointTemporary = true;
                entity.moveDrawing();
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //记录最近一次值 
    this.drawHandler = handler;
    return handler;
};

/**
 * 【绘制】Cesium墙体，绑定单击、鼠标移动、双击事件;
 * 除记录墙体的鼠标拾取的坐标外,还需记录顶部和底部的高程,并赋值给墙体Entity
 * Creates a handler that lets you modify a list of positions.
 */
EventControl.prototype.createDrawWallHandler = function (entity, positions, minimumHeights, maximumHeights) {
    this.setCursor('crosshair');
    var that = this;

    entity.inProgress = true;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    // Adds a point to the positions list.
    handler.lastPointTemporary = false;
    handler.setInputAction(function (event) {
        var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.position, entity);
        if (cartesian) {
            if (handler.lastPointTemporary) {
                positions.pop();
                minimumHeights.pop();
                maximumHeights.pop();
            }
            positions.push(cartesian);
            var cartoPs = Cesium.Cartographic.fromCartesian(cartesian);
            var minHeight = Number(cartoPs.height.toFixed(2));
            var maxHeight = Number(minHeight) + Number(entity.attribute.style.extrudedHeight);
            minimumHeights.push(minHeight);
            maximumHeights.push(maxHeight);
            handler.lastPointTemporary = false;

            entity.changeDrawing();
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Replaces the last point in the list with the point under the mouse.
    handler.setInputAction(function (event) {
        if (event.endPosition) {
            //var cartesian = this.viewer.camera.pickEllipsoid(event.endPosition, this.viewer.scene.globe.ellipsoid);
            var cartesian = _latlng.getCurrentMousePosition(that.viewer.scene, event.endPosition, entity);
            if (cartesian) {
                if (handler.lastPointTemporary) {
                    positions.pop();
                    minimumHeights.pop();
                    maximumHeights.pop();
                }
                positions.push(cartesian);
                var cartoPs = Cesium.Cartographic.fromCartesian(cartesian);
                var minHeight = Number(cartoPs.height.toFixed(2));
                var maxHeight = Number(minHeight) + Number(entity.attribute.style.extrudedHeight);
                minimumHeights.push(minHeight);
                maximumHeights.push(maxHeight);

                handler.lastPointTemporary = true;
                entity.moveDrawing();
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function (event) {
        entity.inProgress = false;
        handler.destroy();
        that.drawHandler = null;

        positions.pop();//必要代码 消除双击带来的多余经纬度 
        minimumHeights.pop();
        maximumHeights.pop();

        entity.stopDrawing();
        entity.startEditing();
        that.setCursor();
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    //记录最近一次值 
    this.drawHandler = handler;

    return handler;
};

/**
 * 【绘制】 释放未完成的创建绘制
 */
EventControl.prototype.destroyDrawHandler = function () {
    this.setCursor();
    if (this.drawHandler) {
        this.setCursor();
        this.drawHandler.destroy();
        this.drawHandler = null;
    }
};

/**
 * 【编辑】 绑定左键单击事件[选中激活编辑+单击空白处取消编辑]
 */
EventControl.prototype.createEditSelectHandler = function (calback) {
    var that = this;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    handler.setInputAction(function (e) { 
        var picked = that.viewer.scene.pick(e.position);
        var pickedEntity = null;
        if (Cesium.defined(picked)) {
            var id = Cesium.defaultValue(picked.id, picked.primitive.id);
            if (id instanceof Cesium.Entity) {
                var inProgress = Cesium.defaultValue(id.inProgress, false);
                if (!inProgress) {
                    pickedEntity = id;
                }
            }
        }

        calback(pickedEntity);//回调

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.selectHandler = handler;
};

/**
 * 【编辑】将协助选择和拖动编辑绑定的拖动到，实体对象 
 * Initialize the utility handler that will assist in selecting and manipulating Dragger billboards.
 */
EventControl.prototype.createEditDraggerHandler = function () {
    var draggerHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    draggerHandler.dragger = null;

    var that = this;
    // Left down selects a dragger
    draggerHandler.setInputAction(function (click) {
        var pickedObject = that.viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject)) {
            var entity = pickedObject.id;
            if (entity && Cesium.defaultValue(entity._isDragger, false)) {
                // Resize the dragger.
                if (entity.billboard) {
                    entity.billboard.scale_src = entity.billboard.scale._value;
                    entity.billboard.scale._value = entity.billboard.scale_src * 1.2;
                }

                draggerHandler.dragger = entity;
                that.viewer.scene.screenSpaceCameraController.enableRotate = false;
                that.viewer.scene.screenSpaceCameraController.enableTilt = false;
                that.viewer.scene.screenSpaceCameraController.enableTranslate = false;
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    // Left down selects a dragger
    draggerHandler.setInputAction(function (click) {
        var pickedObject = that.viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject)) {
            var entity = pickedObject.id;
            if (entity && Cesium.defaultValue(entity._isDragger, false)) {
                // Resize the dragger.    
                if (entity.billboard) {
                    entity.billboard.scale_src = entity.billboard.scale._value;
                    entity.billboard.scale._value = entity.billboard.scale_src * 1.2;
                }

                draggerHandler.dragger = entity;
                that.viewer.scene.screenSpaceCameraController.enableRotate = false;
                that.viewer.scene.screenSpaceCameraController.enableTilt = false;
                that.viewer.scene.screenSpaceCameraController.enableTranslate = false;
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.CTRL);

    // Mouse move drags the draggers and calls their onDrag callback.
    draggerHandler.setInputAction(function (event) {
        if (draggerHandler.dragger) {
            if (draggerHandler.dragger.horizontal) {

                var hit;
                if (draggerHandler.dragger.model) {  //点

                    //在模型上提取坐标
                    var scene = that.viewer.scene;
                    var pickobject = scene.pick(event.endPosition);
                    if (Cesium.defined(pickobject) && pickobject.id == draggerHandler.dragger) {
                        var pickRay = scene.camera.getPickRay(event.endPosition); //提取鼠标点的地理坐标
                        hit = scene.globe.pick(pickRay, scene);
                    }
                }
                 
                if (hit == null)
                    hit =_latlng.getCurrentMousePosition(that.viewer.scene, event.endPosition);

                if (hit) {
                    draggerHandler.dragger.position = hit;
                    if (draggerHandler.dragger.onDrag) {
                        draggerHandler.dragger.onDrag(draggerHandler.dragger, hit);
                    }
                }
            }

            if (draggerHandler.dragger.vertical) {
                var dy = event.endPosition.y - event.startPosition.y;
                var position = draggerHandler.dragger.position._value;
                var tangentPlane = new Cesium.EllipsoidTangentPlane(position);

                scratchBoundingSphere.center = position;
                scratchBoundingSphere.radius = 1;

                var metersPerPixel = that.viewer.scene.frameState.camera.getPixelSize(scratchBoundingSphere,
                            that.viewer.scene.frameState.context.drawingBufferWidth,
                            that.viewer.scene.frameState.context.drawingBufferHeight);

                var zOffset = new Cesium.Cartesian3();

                Cesium.Cartesian3.multiplyByScalar(tangentPlane.zAxis, -dy * metersPerPixel, zOffset);
                var newPosition = Cesium.Cartesian3.clone(position);
                Cesium.Cartesian3.add(position, zOffset, newPosition);

                draggerHandler.dragger.position = newPosition;
                if (draggerHandler.dragger.onDrag) {
                    draggerHandler.dragger.onDrag(draggerHandler.dragger, newPosition);
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    var scratchBoundingSphere = new Cesium.BoundingSphere();

    // Mouse move drags the draggers and calls their onDrag callback.
    draggerHandler.setInputAction(function (event) {
        if (draggerHandler.dragger && draggerHandler.dragger.verticalCtrl) {
            var dy = event.endPosition.y - event.startPosition.y;
            var position = draggerHandler.dragger.position._value;
            var tangentPlane = new Cesium.EllipsoidTangentPlane(position);

            scratchBoundingSphere.center = position;
            scratchBoundingSphere.radius = 1;

            var metersPerPixel = that.viewer.scene.frameState.camera.getPixelSize(scratchBoundingSphere,
                                                                             that.viewer.scene.frameState.context.drawingBufferWidth,
                                                                            that.viewer.scene.frameState.context.drawingBufferHeight);

            var zOffset = new Cesium.Cartesian3();

            Cesium.Cartesian3.multiplyByScalar(tangentPlane.zAxis, -dy * metersPerPixel, zOffset);
            var newPosition = Cesium.Cartesian3.clone(position);
            Cesium.Cartesian3.add(position, zOffset, newPosition);

            draggerHandler.dragger.position = newPosition;
            if (draggerHandler.dragger.onDrag) {
                draggerHandler.dragger.onDrag(draggerHandler.dragger, newPosition);
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.CTRL);

    // Left up stops dragging.
    draggerHandler.setInputAction(function () {
        if (draggerHandler.dragger) {
            if (draggerHandler.dragger.billboard) {
                draggerHandler.dragger.billboard.scale._value = draggerHandler.dragger.billboard.scale_src;
            }

            draggerHandler.dragger = null;
            that.viewer.scene.screenSpaceCameraController.enableRotate = true;
            that.viewer.scene.screenSpaceCameraController.enableTilt = true;
            that.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    // Left up stops dragging.
    draggerHandler.setInputAction(function () {
        if (draggerHandler.dragger) {
            if (draggerHandler.dragger.billboard) {
                draggerHandler.dragger.billboard.scale._value = draggerHandler.dragger.billboard.scale_src;
            }

            draggerHandler.dragger = null;
            that.viewer.scene.screenSpaceCameraController.enableRotate = true;
            that.viewer.scene.screenSpaceCameraController.enableTilt = true;
            that.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_UP, Cesium.KeyboardEventModifier.CTRL);

    this.draggerHandler = draggerHandler;
};

/**
 * 【编辑】 释放编辑相关事件
 */
EventControl.prototype.destroyEditHandler = function () {

    if (this.selectHandler) {
        this.selectHandler.destroy();
        this.selectHandler = null;
    }

    if (this.draggerHandler) {
        this.draggerHandler.destroy();
        this.draggerHandler = null;
    }
};


export default EventControl;