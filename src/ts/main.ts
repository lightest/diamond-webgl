import * as GLCanvas from "./gl-utils/gl-canvas";
import { gl } from "./gl-utils/gl-canvas";
import { Viewport } from "./gl-utils/viewport";

import { Drawer } from "./drawer";
import * as FPSIndicator from "./fps-indicator";
import { Gemstone } from "./gemstone";
import { Parameters } from "./parameters";
import { registerPolyfills } from "./utils";
import { PostProcessing } from "./post-processing";


function main(): void {
    registerPolyfills();

    if (!GLCanvas.initGL()) {
        return;
    }

    let needToAdjustCanvasSize = true;
    Parameters.addCanvasResizeObservers(() => { needToAdjustCanvasSize = true; });

    const drawer = new Drawer(gl);
    const postProcessing = new PostProcessing(gl);

    function loadGemstone(): void {
        Gemstone.loadGemstone(Parameters.cut, (loadedGemstone: Gemstone) => {
            drawer.setGemstone(loadedGemstone);
        });
    }
    Parameters.addCutChangeObserver(loadGemstone);
    loadGemstone();

    function mainLoop(): void {
        FPSIndicator.registerFrame();

        if (needToAdjustCanvasSize) {
            GLCanvas.adjustSize(Parameters.highDPI);
            Viewport.setFullCanvas(gl);
            needToAdjustCanvasSize = false;
        }

        if (Parameters.displayRaytracedVolume) {
            drawer.drawDebugVolume();
        } else {
            if (Parameters.postProcessing && postProcessing.isReady) {
                postProcessing.prepare();
                drawer.draw();
                postProcessing.apply();
            } else {
                drawer.draw();
            }
        }

        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}

main();
