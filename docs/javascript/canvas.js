let CanvasContainer;
let Canvas;
let CanvasContext;
let InitialTime;
let LastRenderTime;
let RenderOnResize;
const FRAMES_PER_SECOND = 60;
const FRAME_DRAW_INTERVAL_MS = 1000 / FRAMES_PER_SECOND;
const FRAME_DRAW_INTERVAL_EPSILLON = 5;
/*
    # Notes

  * Information about the logical layout of `ImageData.data` can be found
    here: https://html.spec.whatwg.org/multipage/canvas.html#dom-imagedata-data.
    Specifically, the layout is left-to-right and top-to-bottom, with red, green,
    blue, and alpha components per pixel.


*/
/**
 * Initialize the canvas object and set various event handlers
 * @param canvasContainer The div container of the canvas and related elements
 */
export default function InitCanvas(canvasContainer) {
    var _a;
    InitialTime = Date.now();
    LastRenderTime = 0;
    CanvasContainer = canvasContainer;
    let currentStyle = (_a = CanvasContainer.getAttribute("style")) !== null && _a !== void 0 ? _a : "";
    let newStyle = `\
color: #EEE; \
background-color: #222; 
${currentStyle}`;
    CanvasContainer.setAttribute("style", "color: #EEE; background-color: #222; " + currentStyle);
    Canvas = document.createElement("canvas");
    Canvas.hidden = true;
    CanvasContainer.appendChild(Canvas);
    let canvasStyle = `\
position: absolute;
top: 0; \
left: 0; \
right: 0; \
bottom: 0; `;
    Canvas.setAttribute("style", canvasStyle);
    let maybeContext = Canvas.getContext("2d");
    if (maybeContext instanceof CanvasRenderingContext2D) {
        CanvasContext = maybeContext;
    }
    else {
        throw "Failed to get the 2D context";
    }
    window.onclick = WindowOnClick;
    window.onresize = UpdateCanvasSize;
    UpdateCanvasSize();
    Canvas.hidden = false;
}
let IsCycling = false;
let ContinueAnimating = false;
function WindowOnClick() {
    ContinueAnimating = !IsCycling; // stop animating if we are about to stop cycling
    if (IsCycling) {
        // stop cycling
        setTimeout(() => {
            RenderOnResize = true;
            UpdateCanvasSize();
        }, 100);
    }
    else {
        //start cycling
        RenderOnResize = false;
        DrawCyclingColors();
    }
    IsCycling = !IsCycling;
}
function DrawResize() {
    DrawSingleFrame();
}
function DrawRandomGradient() {
    let leftColor = [];
    let rightColor = [];
    for (var i = 0; i < 3; i++) {
        leftColor.push(Math.random() * 255);
        rightColor.push(Math.random() * 255);
    }
    leftColor.push(255);
    rightColor.push(255);
    DrawHorizontalLinearGradient(leftColor, rightColor);
}
function UpdateCanvasSize() {
    Canvas.height = CanvasContainer.clientHeight;
    Canvas.width = CanvasContainer.clientWidth;
    if (RenderOnResize) {
        DrawResize();
    }
}
const FULL_CYCLE_MS = 10000;
const SUB_CYCLES = 3;
const CYCLE_FULL_RED = 0;
const CYCLE_FULL_GREEN = 1 / SUB_CYCLES;
const CYCLE_FULL_BLUE = 2 / SUB_CYCLES;
function DrawSolidColor(rgba) {
    let imageData = new ImageData(Canvas.width, Canvas.height);
    let bytes = imageData.data;
    const imageSize = bytes.length;
    for (var i = 0; i < imageSize; i += 4) {
        bytes[i + 0] = rgba[0];
        bytes[i + 1] = rgba[1];
        bytes[i + 2] = rgba[2];
        bytes[i + 3] = rgba[3];
    }
    CanvasContext.putImageData(imageData, 0, 0);
}
function DrawHorizontalLinearGradient(leftRgba, rightRgba) {
    let deltaRgba = [
        leftRgba[0] - rightRgba[0],
        leftRgba[1] - rightRgba[1],
        leftRgba[2] - rightRgba[2],
        leftRgba[3] - rightRgba[3],
    ];
    const imageWidth = Canvas.width;
    const imageHeight = Canvas.height;
    let imageData = new ImageData(imageWidth, imageHeight);
    let bytes = imageData.data;
    let columnColors = [];
    for (let i = 0; i < imageWidth; i++) {
        let progress = i / imageWidth;
        columnColors[i] = [
            Math.round(leftRgba[0] - (deltaRgba[0] * progress)),
            Math.round(leftRgba[1] - (deltaRgba[1] * progress)),
            Math.round(leftRgba[2] - (deltaRgba[2] * progress)),
            Math.round(leftRgba[3] - (deltaRgba[3] * progress))
        ];
    }
    const imageSize = bytes.length;
    for (let i = 0; i < imageSize; i += 4) {
        let pixelNum = i / 4;
        let colNum = pixelNum % imageWidth;
        let color = columnColors[colNum];
        bytes[i + 0] = color[0];
        bytes[i + 1] = color[1];
        bytes[i + 2] = color[2];
        bytes[i + 3] = color[3];
    }
    CanvasContext.putImageData(imageData, 0, 0);
}
function DrawNextColor(deltaTime) {
    let imageData = new ImageData(Canvas.width, Canvas.height);
    let bytes = imageData.data;
    let cycleProgress = (deltaTime % FULL_CYCLE_MS) / FULL_CYCLE_MS;
    let subCycleProgress = (cycleProgress * SUB_CYCLES) % 1; // percent through current sub cycle
    let red = 0, green = 0, blue = 0;
    if (cycleProgress < CYCLE_FULL_GREEN) {
        //transition from red-to-green
        red = 1 - subCycleProgress;
        green = subCycleProgress;
        blue = 0;
    }
    else if (cycleProgress < CYCLE_FULL_BLUE) {
        //transition from green-to-blue
        red = 0;
        green = 1 - subCycleProgress;
        blue = subCycleProgress;
    }
    else {
        //transition from blue-to-red
        red = subCycleProgress;
        green = 0;
        blue = 1 - subCycleProgress;
    }
    const redByte = Math.round(red * 255);
    const greenByte = Math.round(green * 255);
    const blueByte = Math.round(blue * 255);
    DrawSolidColor([redByte, greenByte, blueByte, 255]);
}
function DrawCyclingColors() {
    InitialTime = performance.now();
    window.requestAnimationFrame(DrawNewFrame);
    function DrawNewFrame(time) {
        let runTime = time - InitialTime;
        DrawNextColor(runTime);
        LastRenderTime = runTime;
        if (ContinueAnimating)
            window.requestAnimationFrame(DrawNewFrame);
    }
}
function DrawSingleFrame() {
    DrawRandomGradient();
}
/*
    Old timer method


    // TimerCallback();

    // function TimerCallback(): void {
    //     let now = Date.now();
    //     let timeSinceLastFrame = now - LastRenderTime;
    //     let timeUntilNextFrame = FRAME_DRAW_INTERVAL_MS - timeSinceLastFrame;
    
    //     if (timeUntilNextFrame < FRAME_DRAW_INTERVAL_EPSILLON) {
    //         DrawSolidColor(now - InitialTime);
    //         LastRenderTime = now;
    //         setTimeout(TimerCallback, FRAME_DRAW_INTERVAL_MS - 1);
    //     } else {
    //         setTimeout(TimerCallback, timeUntilNextFrame - 1);
    //     }
    // }
*/
//# sourceMappingURL=canvas.js.map