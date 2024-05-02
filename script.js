document.addEventListener("DOMContentLoaded", function() {
    const ConvertImage = document.querySelector('.imageConvert');
    ConvertImage.addEventListener('click', convertImage);

    const xyzCompareButton = document.querySelector('.xyzCompare');
    xyzCompareButton.addEventListener('click', compareXYZ);
    const rgbCompareButton = document.querySelector('.rgbCompare');
    rgbCompareButton.addEventListener('click', compareRGB);
});


const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const imageUpload = document.getElementById("imageUpload");

imageUpload.addEventListener("change", function() {
    const file = this.files[0];

    if (file) {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };

                img.src = event.target.result;
            };

            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file.");
        }
    }
});

function convertImage() {
    const canvasXYZ = document.getElementById("myCanvasXYZ");
    const ctxXYZ = canvasXYZ.getContext("2d");
    ctxXYZ.clearRect(0, 0, canvasXYZ.width, canvasXYZ.height);

    ctxXYZ.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasXYZ.width, canvasXYZ.height);

    const imageData = ctxXYZ.getImageData(0, 0, canvasXYZ.width, canvasXYZ.height);
    RGBToXYZ(imageData, 1, 1, 1);
    ctxXYZ.putImageData(imageData, 0, 0);

    canvasXYZ.addEventListener('click', function(event) {
        const xyzPixelInfoLabel = document.querySelector('.xyzPixelInfo');
        const ctxXYZ = canvasXYZ.getContext("2d");

        const x = event.offsetX;
        const y = event.offsetY;

        const imageData = ctxXYZ.getImageData(x, y, 1, 1);
        const X = imageData.data[0] / 255;
        const Y = imageData.data[1] / 255;
        const Z = imageData.data[2] / 255;

        let r = 3.240479 * X - 1.537150 * Y - 0.498535 * Z;
        let g = -0.969256 * X + 1.875992 * Y + 0.041556 * Z;
        let b = 0.055648 * X - 0.204043 * Y + 1.057311 * Z;

        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : r * 12.92;
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : g * 12.92;
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : b * 12.92;

        r = Math.min(Math.max(r, 0), 1);
        g = Math.min(Math.max(g, 0), 1);
        b = Math.min(Math.max(b, 0), 1);

        const pixelColorXYZ = `${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}`;
        const pixelColorRGB = `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;

        const hexColor = rgbToHex(imageData.data[0], imageData.data[1], imageData.data[2]);

        xyzPixelInfoLabel.innerHTML = `Координати: (${x}, ${y}), <br> Колір (XYZ): ${pixelColorXYZ}, <br> Колір (RGB): ${pixelColorRGB} 
        <br> <div style="width: 100px; height: 20px; background-color: ${hexColor}; display: inline-block; margin-left: 10px;"></div>`;
    });

    //---------------------------------------------

    const canvasRGB = document.getElementById("myCanvasRGB");
    const ctxRGB = canvasRGB.getContext("2d");
    ctxRGB.clearRect(0, 0, canvasRGB.width, canvasRGB.height);

    ctxRGB.drawImage(canvasXYZ, 0, 0, canvasXYZ.width, canvasXYZ.height, 0, 0, canvasRGB.width, canvasRGB.height);

    const imageDataRGB = ctxRGB.getImageData(0, 0, canvasRGB.width, canvasRGB.height);
    XYZToRGB(imageDataRGB);
    ctxRGB.putImageData(imageDataRGB, 0, 0);

    canvasRGB.addEventListener('click', function(event) {
        const rgbPixelInfoLabel = document.querySelector('.rgbPixelInfo');
        const ctxRGB = canvasRGB.getContext("2d");

        const x = event.offsetX;
        const y = event.offsetY;

        const imageData = ctxRGB.getImageData(x, y, 1, 1);

        const R = imageData.data[0] / 255;
        const G = imageData.data[1] / 255;
        const B = imageData.data[2] / 255;

        let X = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
        let Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
        let Z = 0.0193339 * R + 0.1191920 * G + 0.9503041 * B;

        const pixelColorXYZ = `${Math.round(X * 255)}, ${Math.round(Y * 255)}, ${Math.round(Z * 255)}`;
        const pixelColorRGB = `${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}`;

        const hexColor = rgbToHex(imageData.data[0], imageData.data[1], imageData.data[2]);

        rgbPixelInfoLabel.innerHTML = `Координати: (${x}, ${y}), <br> Колір (RGB): ${pixelColorRGB}, <br> Колір (XYZ): ${pixelColorXYZ} 
        <br> <div style="width: 100px; height: 20px; background-color: ${hexColor}; display: inline-block; margin-left: 10px;"></div>`;
    });
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}


function RGBToXYZ(imageData, redBalance, greenBalance, blueBalance){

    const data = imageData.data;
    const a = 0.055; 
    
    console.log("R:", data[0], "G:", data[1], "B:", data[2]);
    for (let i = 0; i < data.length; i += 4) {
        let R = data[i] / 255 * redBalance;
        let G = data[i + 1] / 255 * greenBalance;
        let B = data[i + 2] / 255 * blueBalance;
       
        R = (R > 0.04045) ? Math.pow((R + a) / (1 + a), 2.4) : R / 12.92;
        G = (G > 0.04045) ? Math.pow((G + a) / (1 + a), 2.4) : G / 12.92;
        B = (B > 0.04045) ? Math.pow((B + a) / (1 + a), 2.4) : B / 12.92;

        let X = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
        let Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
        let Z = 0.0193339 * R + 0.1191920 * G + 0.9503041 * B;

        data[i] = X * 255;
        data[i + 1] = Y * 255;
        data[i + 2] = Z * 255;

        if (i === 0) {
            console.log("X:", X, "Y:", Y, "Z:", Z);
        }
    }
}

function XYZToRGB(imageData){
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const X = data[i] / 255;
        const Y = data[i + 1] / 255;
        const Z = data[i + 2] / 255;

        let r = 3.240479 * X - 1.537150 * Y - 0.498535 * Z;
        let g = -0.969256 * X + 1.875992 * Y + 0.041556 * Z;
        let b = 0.055648 * X - 0.204043 * Y + 1.057311 * Z;

        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : r * 12.92;
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : g * 12.92;
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : b * 12.92;

        r = Math.min(Math.max(r, 0), 1);
        g = Math.min(Math.max(g, 0), 1);
        b = Math.min(Math.max(b, 0), 1);

        data[i] = r * 255;
        data[i + 1] = g * 255;
        data[i + 2] = b * 255;

        if (i === 0) {
            console.log("RGB:", r, g, b);
        }
        
    }
}

function compareXYZ() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const canvasXYZ = document.getElementById("myCanvasXYZ");
    const ctxXYZ = canvasXYZ.getContext("2d");
    const convertedImageData = ctxXYZ.getImageData(0, 0, canvasXYZ.width, canvasXYZ.height);

    compare(originalImageData, convertedImageData, "XYZ");
}

function compareRGB() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const canvasRGB = document.getElementById("myCanvasRGB");
    const ctxRGB = canvasRGB.getContext("2d");
    const convertedImageData = ctxRGB.getImageData(0, 0, canvasRGB.width, canvasRGB.height);

    compare(originalImageData, convertedImageData, "RGB");
}

function compare(originalImageData, convertedImageData, type) {
    const originalData = originalImageData.data;
    const convertedData = convertedImageData.data;

    let mismatchIndex = -1;

    for (let i = 0; i < originalData.length; i += 4) {
        let mismatch = false;
        for (let j = 0; j < 3; j++) {
            const originalValue = originalData[i + j];
            const convertedValue = convertedData[i + j];

            if (Math.abs(originalValue - convertedValue) > 15) {
                mismatch = true;
                mismatchIndex = i / 4;
                break;
            }
        }

        if (mismatch) {
            const mismatchMessage = `Mismatch found at pixel index ${mismatchIndex}.
            \nOriginal value: ${originalData[i]}, ${originalData[i + 1]}, ${originalData[i + 2]}
            \nConverted value: ${convertedData[i]}, ${convertedData[i + 1]}, ${convertedData[i + 2]}`;

            const labelElement = document.querySelector('.labels');
            labelElement.innerHTML = mismatchMessage.replace(/\n/g, "<br>");

            console.log(mismatchMessage);
            break;
        }
    }

    if (mismatchIndex === -1) {
        const matchMessage = `${type} conversion matches.`;

        const labelElement = document.querySelector('.labels');
        labelElement.textContent = matchMessage;

        console.log(matchMessage);
    } 
}

function outputUpdateDepth(value) {
    const redBalance = document.getElementById('redSlider').value;
    const greenBalance = document.getElementById('greenSlider').value;
    const blueBalance = document.getElementById('blueSlider').value;
    const canvasXYZ = document.getElementById("myCanvasXYZ");
    const ctxXYZ = canvasXYZ.getContext("2d");
    ctxXYZ.clearRect(0, 0, canvasXYZ.width, canvasXYZ.height);
    
    ctxXYZ.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasXYZ.width, canvasXYZ.height);

    const imageData = ctxXYZ.getImageData(0, 0, canvasXYZ.width, canvasXYZ.height);
    
    RGBToXYZ(imageData, redBalance, greenBalance, blueBalance);

    ctxXYZ.putImageData(imageData, 0, 0);



    
    const canvasRGB = document.getElementById("myCanvasRGB");
    const ctxRGB = canvasRGB.getContext("2d");
    ctxRGB.clearRect(0, 0, canvasRGB.width, canvasRGB.height);

    ctxRGB.drawImage(canvasXYZ, 0, 0, canvasXYZ.width, canvasXYZ.height, 0, 0, canvasRGB.width, canvasRGB.height);

    const imageDataRGB = ctxRGB.getImageData(0, 0, canvasRGB.width, canvasRGB.height);
    XYZToRGB(imageDataRGB);
    ctxRGB.putImageData(imageDataRGB, 0, 0);

}
function changeOrangeSaturationRGB() {
    const canvasrgb = document.getElementById("myCanvasRGB");
    const ctxrgb = canvasrgb.getContext("2d");
    const imageData = ctxrgb.getImageData(xr1, yr1, xr2 - xr1, yr2 - yr1);
    const saturationChange = parseFloat(document.getElementById('saturation').value);

    for (let i = 0; i < imageData.data.length; i += 4) {

        const r = imageData.data[i] / 255;
        const g = imageData.data[i + 1] / 255;
        const b = imageData.data[i + 2] / 255;

        let hsv = rgbToHsv(r, g, b);

        console.log(`${hsv}`); 

        if ((hsv[0] >= 0.03 && hsv[0] <= 0.010)) {
            hsv[1] = saturationChange;
            hsv[1] = Math.max(0, Math.min(1, hsv[1])); 
        }

        const rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);

        imageData.data[i] = rgb[0] * 255;
        imageData.data[i + 1] = rgb[1] * 255;
        imageData.data[i + 2] = rgb[2] * 255;
    }

    ctxrgb.putImageData(imageData, xr1, yr1);
}

function changeOrangeSaturationXYZ() {
    const canvasxyz = document.getElementById("myCanvasXYZ");
    const ctxxyz = canvasxyz.getContext("2d");
    const imageData = ctxxyz.getImageData(x1, y1, x2 - x1, y2 - y1);
    const saturationChange = parseFloat(document.getElementById('saturation').value);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const x = imageData.data[i] / 255;
        const y = imageData.data[i + 1] / 255;
        const z = imageData.data[i + 2] / 255;

        let r = 3.240479 * x - 1.537150 * y - 0.498535 * z;
        let g = -0.969256 * x + 1.875992 * y + 0.041556 * z;
        let b = 0.055648 * x - 0.204043 * y + 1.057311 * z;

        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : r * 12.92;
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : g * 12.92;
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : b * 12.92;

        r = Math.min(Math.max(r, 0), 1);
        g = Math.min(Math.max(g, 0), 1);
        b = Math.min(Math.max(b, 0), 1);

        let hsv = rgbToHsv(r, g, b);

        if ((hsv[0] >= 0.03 && hsv[0] <= 0.09)) {
            hsv[1] = saturationChange;
            hsv[1] = Math.max(0, Math.min(1, hsv[1])); 
        }

        const rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);

        let R = rgb[0];
        let G = rgb[1];
        let B = rgb[2];

        R = (R > 0.04045) ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
        G = (G > 0.04045) ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
        B = (B > 0.04045) ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

        let X = 0.4124564 * R + 0.3575761 * G + 0.1804375 * B;
        let Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
        let Z = 0.0193339 * R + 0.1191920 * G + 0.9503041 * B;

        imageData.data[i] = X * 255;
        imageData.data[i + 1] = Y * 255;
        imageData.data[i + 2] = Z * 255;
    }

    ctxxyz.putImageData(imageData, x1, y1);
}

let lastCanvas; 

function outputUpdateSaturation(value) {
    if (lastCanvas === 'myCanvasXYZ') {
        changeOrangeSaturationXYZ();
    } else if (lastCanvas === 'myCanvasRGB') {
        changeOrangeSaturationRGB();
    } else {
        changeOrangeSaturationRGB();
        changeOrangeSaturationXYZ();
    }
}

const canvasxyz = document.getElementById('myCanvasXYZ');
const ctxxyz = canvasxyz.getContext('2d');
let isDrawing = false;
let x1, y1, x2, y2;

function chooseFragment(event) {
    switch (event.type) {
        case 'mousedown':
            isDrawing = true;
            x1 = event.offsetX;
            y1 = event.offsetY;
            break;
        case 'mouseup':
            if (isDrawing) {
                isDrawing = false;
                x2 = event.offsetX;
                y2 = event.offsetY;
                drawSelection();
                lastCanvas = 'myCanvasXYZ'; 
                changeOrangeSaturationXYZ();
            }
            break;
    }
}

function drawSelection() {
    ctxxyz.beginPath();
    ctxxyz.rect(x1, y1, x2 - x1, y2 - y1);
    ctxxyz.strokeStyle = 'antiquewhite';
    ctxxyz.lineWidth = 1.5;
    ctxxyz.stroke();
}

canvasxyz.addEventListener('mousedown', chooseFragment);
canvasxyz.addEventListener('mousemove', chooseFragment);
canvasxyz.addEventListener('mouseup', chooseFragment);

//-------------------------------------------------------

let xr1, yr1, xr2, yr2;
const canvasrgb = document.getElementById('myCanvasRGB');
const ctxrgb = canvasrgb.getContext('2d');

function chooseFragmentRGB(event) {
    switch (event.type) {
        case 'mousedown':
            isDrawing = true;
            xr1 = event.offsetX;
            yr1 = event.offsetY;
            break;
        case 'mouseup':
            if (isDrawing) {
                isDrawing = false;
                xr2 = event.offsetX;
                yr2 = event.offsetY;
                drawSelectionRGB();
                lastCanvas = 'myCanvasRGB'; 
                changeOrangeSaturationRGB();
            }
            break;
    }
}

function drawSelectionRGB() {
    ctxrgb.beginPath();
    ctxrgb.rect(xr1, yr1, xr2 - xr1, yr2 - yr1);
    ctxrgb.strokeStyle = 'antiquewhite';
    ctxrgb.lineWidth = 1.5;
    ctxrgb.stroke();
}

canvasrgb.addEventListener('mousedown', chooseFragmentRGB);
canvasrgb.addEventListener('mousemove', chooseFragmentRGB);
canvasrgb.addEventListener('mouseup', chooseFragmentRGB);

function rgbToHsv(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; 
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, v];
}

function hsvToRgb(h, s, v) {
    let r, g, b;
    let i, f, p, q, t;

    if (s === 0) {
        r = g = b = v;
        return [r, g, b];
    }

    h *= 6; 

    i = Math.floor(h);
    f = h - i;
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r, g, b];
}