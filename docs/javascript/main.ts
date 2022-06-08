import InitCanvas from "./canvas.js";

window.onload = function () {
    let canvasContainer = document.getElementById("main-container") as HTMLDivElement;

    canvasContainer.setAttribute("style", "position: absolute; top: 0; left: 0; right: 0; bottom: 0;");

    InitCanvas(canvasContainer);
};
