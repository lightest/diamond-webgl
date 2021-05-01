import * as GLCanvas from "./gl-utils/gl-canvas";
import { gl } from "./gl-utils/gl-canvas";
import { Viewport } from "./gl-utils/viewport";

import { Drawer } from "./drawer";
import { Gemstone } from "./gemstone";

import { registerPolyfills } from "./utils";

import { Parameters } from "./parameters";
import * as FPSIndicator from "./fps-indicator";


function main(): void {
    registerPolyfills();

    if (!GLCanvas.initGL()) {
        return;
    }

    let needToAdjustCanvasSize = true;
    Parameters.addCanvasResizeObservers(() => { needToAdjustCanvasSize = true; });

    const drawer = new Drawer(gl);

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
            drawer.draw();
        }

        requestAnimationFrame(mainLoop);
    }
    mainLoop();
}

main();
