import * as GLCanvas from "./gl-utils/gl-canvas";
import { gl } from "./gl-utils/gl-canvas";
import { Viewport } from "./gl-utils/viewport";

import { Drawer } from "./drawer";
import { Gemstone } from "./gemstone";

import { registerPolyfills } from "./utils";

import "./page-interface-generated";
import { Parameters } from "./parameters";


function main(): void {
    registerPolyfills();

    if (!GLCanvas.initGL()) {
        return;
    }

    let needToAdjustCanvasSize = true;
    function adjustCanvasSize(): void {
        if (needToAdjustCanvasSize) {
            GLCanvas.adjustSize(false);
            Viewport.setFullCanvas(gl);
            needToAdjustCanvasSize = false;
        }
    }
    Page.Canvas.Observers.canvasResize.push(() => { needToAdjustCanvasSize = true; });

    const drawer = new Drawer(gl);

    let timeOfLastFPSUpdate = performance.now();
    let framesSinceLastFPSUpdate = 0;
    setInterval(() => {
        const now = performance.now();
        const fps = 1000 * framesSinceLastFPSUpdate / (now - timeOfLastFPSUpdate);
        timeOfLastFPSUpdate = now;
        framesSinceLastFPSUpdate = 0;

        Page.Canvas.setIndicatorText("fps-indicator", Math.round(fps).toString());
    }, 500);

    function loadGemstone(): void {
        Gemstone.loadGemstone(Parameters.cut, (loadedGemstone: Gemstone) => {
            drawer.setGemstone(loadedGemstone);
        });
    }
    Parameters.addCutChangeObserver(loadGemstone);
    loadGemstone();

    function mainLoop(): void {
        framesSinceLastFPSUpdate++;

        adjustCanvasSize();

        if (Parameters.displayRaytracedVolume) {
            drawer.drawDebugVolume();
        } else {
            drawer.draw();
        }

        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}

main();
