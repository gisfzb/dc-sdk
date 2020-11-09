const { Cesium } = DC.Namespace

import defined from '../utils/defined.js';

function LabelUtils() {
}

LabelUtils.createHiDPICanvas = function(w, h, ratio) {
    if (!ratio) { ratio = this.getPX(); }
    var can = document.createElement('canvas');
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + 'px';
    can.style.height = h + 'px';
    can.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
};

LabelUtils.getPX = function() {
    var c = document.createElement('canvas'),
        ctx = c.getContext('2d'),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx['webkitBackingStorePixelRatio'] ||
            ctx['mozBackingStorePixelRatio'] ||
            ctx['msBackingStorePixelRatio'] ||
            ctx['oBackingStorePixelRatio'] ||
            ctx['backingStorePixelRatio'] || 1;
    return dpr / bsr;
};

LabelUtils.pdValues = function(p1) {
    if (p1 !== null && typeof p1 !== 'undefined' && p1 !== {}) {
        return true;
    }
    return false;
};

LabelUtils.updateCanvas = function(text, color) {

    // switch (background) {
    //     case 'background1':
    //         background = 'http://q83x8nxjf.bkt.clouddn.com/videoBorad.png';
    //         break;
    //     case 'background2':
    //         background = 'http://q83x8nxjf.bkt.clouddn.com/labelbackground1.png';
    //         break;
    //     case 'background3':
    //         background = 'http://q83x8nxjf.bkt.clouddn.com/labelbackground2.png';
    //         break;
    //     default:
    //         background = 'http://q83x8nxjf.bkt.clouddn.com/videoBorad.png';
    //         break;
    // }

    // var imgs = new Image();
    // imgs.crossOrigin = 'anonymous';
    // imgs.src = background;
    var canvas = LabelUtils.createHiDPICanvas(100, 50, 15);
    // imgs.onload = function() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 100, 50);
    ctx.strokeStyle = color;
    ctx.font = '6px 微软雅黑';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    var str = text.length;
    var roll = Math.ceil(str / 14) <= 3 ? Math.ceil(str / 14) : 3;
    var rolladd = 1;
    while (rolladd <= roll) {
        ctx.fillText(text.substring((rolladd - 1) * 14, rolladd * 14), 50, 25 + (rolladd - 1) * 7);
        rolladd++;
    }
    // ctx.drawImage(this, 0, 0, 100, 50);
    // };
    return canvas;
};

LabelUtils.updateCanvas2 = function(text, textcolor) {
    var labelDiv = document.createElement('div');
    labelDiv.style.width = '300px';
    labelDiv.style.height = '200px';
    labelDiv.style.position = 'absolute';
    labelDiv.style.pointerEvents = 'none';
    var labelCanvas = this.createHiDPICanvas(300, 200, 2);
    labelDiv.appendChild(labelCanvas);
    var ctx = labelCanvas.getContext('2d');
    ctx.strokeStyle = textcolor;
    ctx.beginPath();
    ctx.lineTo(0, 200);
    ctx.lineTo(100, 100);
    ctx.lineTo(220, 100);
    ctx.stroke();
    ctx.font = '12px console';
    ctx.fillStyle = textcolor;
    ctx.fillText(text, 110, 90);
    return labelCanvas;
};

LabelUtils.updateCanvas3 = function(text, textcolor) {
    var canvas = LabelUtils.createHiDPICanvas(100, 500, 2);
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.strokeStyle = textcolor;
    ctx.beginPath();
    ctx.lineTo(50, 500);
    ctx.lineTo(50, 400);
    ctx.arc(50, 150, 48, 0.5 * Math.PI, 2.5 * Math.PI);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = '20px console';
    ctx.fillStyle = textcolor;
    ctx.fillText(text, 50, 155);
    return canvas;
};

LabelUtils.updateCanvas4 = function(id, text, textcolor, background, callback) {

    switch (background) {
        case 'background1':
            background = 'http://www.imapway.cn/mw3dsdk/Resource/img/labelbackground.png';
            break;
        case 'background2':
            background = 'http://www.imapway.cn/mw3dsdk/Resource/img/labelbackground1.png';
            break;
        case 'background3':
            background = 'http://www.imapway.cn/mw3dsdk/Resource/img/labelbackground2.png';
            break;
        case 'null':
            background = null;
            break;
        default:
            background = 'http://www.imapway.cn/mw3dsdk/Resource/img/labelbackground.png';
            break;
    }

    if (defined(background)) {
        var imgs = new Image();
        imgs.crossOrigin = 'anonymous';
        imgs.src = background;
        var canvas = LabelUtils.createHiDPICanvas(100, 50, 15);
        imgs.onload = function() {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 100, 50);
            ctx.strokeStyle = textcolor;
            ctx.font = '6px 微软雅黑';
            ctx.fillStyle = textcolor;
            ctx.textAlign = 'center';
            var str = text.length;
            var roll = Math.ceil(str / 14) <= 3 ? Math.ceil(str / 14) : 3;
            var rolladd = 1;
            while (rolladd <= roll) {
                ctx.fillText(text.substring((rolladd - 1) * 14, rolladd * 14), 50, 25 + (rolladd - 1) * 7);
                rolladd++;
            }
            ctx.drawImage(this, 0, 0, 100, 50);
            var s = {
                id: id,
                canvas: canvas
            };
            callback(s);
        };
    } else {
        var canvas2 = LabelUtils.createHiDPICanvas(100, 50, 15);
        var ctx = canvas2.getContext('2d');
        ctx.clearRect(0, 0, 100, 50);
        ctx.strokeStyle = textcolor;
        ctx.font = '6px 微软雅黑';
        ctx.fillStyle = textcolor;
        ctx.textAlign = 'center';
        var str = text.length;
        var roll = Math.ceil(str / 14) <= 3 ? Math.ceil(str / 14) : 3;
        var rolladd = 1;
        while (rolladd <= roll) {
            ctx.fillText(text.substring((rolladd - 1) * 14, rolladd * 14), 50, 25 + (rolladd - 1) * 7);
            rolladd++;
        }
        var s = {
            id: id,
            canvas: canvas2
        };
        callback(s);
    }
};

LabelUtils.updateCanvas6 = function(text, textcolor) {
    var canvas = LabelUtils.createHiDPICanvas(100, 50, 15);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 100, 50);
    ctx.strokeStyle = textcolor;
    ctx.font = '6px 微软雅黑';
    ctx.fillStyle = textcolor;
    ctx.textAlign = 'center';
    var str = text.length;
    var roll = Math.ceil(str / 14) <= 3 ? Math.ceil(str / 14) : 3;
    var rolladd = 1;
    while (rolladd <= roll) {
        ctx.fillText(text.substring((rolladd - 1) * 14, rolladd * 14), 50, 25 + (rolladd - 1) * 7);
        rolladd++;
    }
    return canvas;
};

LabelUtils.updateCanvas7 = function(title, color, text) {
    var canvas = LabelUtils.createHiDPICanvas(150, 220, 2);
    var ctx = canvas.getContext('2d');
    ctx.font = '22px console';
    ctx.fillStyle = color;
    ctx.fillText(title, 0, 30);
    ctx.font = '16px console';
    for (var index = 0; index < text.length; index++) {
        var ele = text[index];
        var titlecolor = ele.titlecolor;
        var texttitle = ele.title;
        var textcolor = ele.textcolor;
        var texttext = ele.text;
        ctx.fillStyle = titlecolor;
        ctx.fillText(texttitle, (index % 2 === 0) ? 0 : 90, (Math.ceil((index + 1) / 2) === 0 ? 1 : Math.ceil((index + 1) / 2)) * 60);
        ctx.fillStyle = textcolor;
        ctx.fillText(texttext, (index % 2 === 0) ? 0 : 90, (Math.ceil((index + 1) / 2) === 0 ? 1 : Math.ceil((index + 1) / 2)) * 60 + 20);
    }
    return canvas;
};

LabelUtils.updateCanvas8 = function(text, background, callback, color) {

    switch (background) {
        case 'icon1':
            background = Cesium.buildModuleUrl('Images/PublicIcon/1.png');
            break;
        case 'icon2':
            background = Cesium.buildModuleUrl('Images/PublicIcon/2.png');
            break;
        case 'icon3':
            background = Cesium.buildModuleUrl('Images/PublicIcon/3.png');
            break;
        case 'icon4':
            background = Cesium.buildModuleUrl('Images/PublicIcon/4.png');
            break;
        case 'icon5':
            background = Cesium.buildModuleUrl('Images/PublicIcon/5.png');
            break;
        case 'icon6':
            background = Cesium.buildModuleUrl('Images/PublicIcon/6.png');
            break;
        default:
            background = Cesium.buildModuleUrl('Images/PublicIcon/1.png');
            break;
    }

    var imgs = new Image();
    imgs.src = background;
    imgs.onload = function() {
        var canvas = LabelUtils.createHiDPICanvas(100, 50, 2);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(text, 20, 40);
        ctx.drawImage(this, 0, 0, 50, 25);
        callback(canvas);
    };
};

LabelUtils.updateCanvas9 = function(title, text, color) {
    var labelDiv = document.createElement('div');
    labelDiv.style.width = '300px';
    labelDiv.style.height = '200px';
    labelDiv.style.position = 'absolute';
    labelDiv.style.pointerEvents = 'none';
    var labelCanvas = LabelUtils.createHiDPICanvas(300, 200, 2);
    labelDiv.appendChild(labelCanvas);
    var ctx = labelCanvas.getContext('2d');
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineTo(0, 200);
    ctx.lineTo(100, 100);
    ctx.lineTo(220, 100);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '20px console';
    // ctx.fillStyle = 'rgb(0,191,255)';
    ctx.fillText(title, 110, 90);

    ctx.font = '12px console';
    // ctx.fillStyle='rgb(192,192,192)';
    ctx.fillText(text, 110, 130);
    return labelCanvas;
};


LabelUtils.updateCanvas10 = function(text, color) {

    // switch (background) {
    //     case 'background1':
    //         background = 'http://q83x8nxjf.bkt.clouddn.com/videoBorad.png';
    //         break;
    //     case 'background2':
    //         background = 'http://q83x8nxjf.bkt.clouddn.com/labelbackground1.png';
    //         break;
    //     case 'background3':
    //         background = 'http://q83x8nxjf.bkt.clouddn.com/labelbackground2.png';
    //         break;
    //     default:
    //         background = 'http://q83x8nxjf.bkt.clouddn.com/videoBorad.png';
    //         break;
    // }

    // var imgs = new Image();
    // imgs.crossOrigin = 'anonymous';
    // imgs.src = background;
    var canvas = LabelUtils.createHiDPICanvas(100, 50, 15);
    // imgs.onload = function() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 100, 50);
    ctx.strokeStyle = color;
    ctx.font = '6px 微软雅黑';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    var str = text.length;
    var roll = Math.ceil(str / 14) <= 3 ? Math.ceil(str / 14) : 3;
    var rolladd = 1;
    while (rolladd <= roll) {
        ctx.fillText(text.substring((rolladd - 1) * 14, rolladd * 14), 50, 25 + (rolladd - 1) * 7);
        rolladd++;
    }
    // ctx.drawImage(this, 0, 0, 100, 50);
    // };
    return canvas;
};

LabelUtils.paseRgba = function(str, type) {
    if (type === null) {
        type = 'null';
    }
    str = str.split('(')[1].split(')')[0].split(',');
    if (type === 'GLH') {
        str[3] *= 255;
        var newStr = [];
        str.forEach(function(element) {
            element = (element / 255).toFixed(2);
            newStr.push(element);
        });
        return newStr;
    }
    return str;
};

LabelUtils.transCoordinate = function(viewer, cartesian, height) {
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
    var lat = Cesium.Math.toDegrees(cartographic.latitude);
    var lng = Cesium.Math.toDegrees(cartographic.longitude);
    var cartesian2 = Cesium.Cartesian3.fromDegrees(lng, lat, height, ellipsoid);
    return cartesian2;
};
export default LabelUtils;
