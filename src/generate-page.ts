import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { Demopage } from "webpage-templates";

const data = {
    title: "Gems",
    description: "PLACEHOLDER_DESCRIPTION",
    introduction: [
        "PLACEHOLDER_INTRODUCTION",
    ],
    githubProjectName: "gems-webgl",
    additionalLinks: [],
    styleFiles: [],
    scriptFiles: [
        "script/gl-matrix-2.5.1-min.js",
        "script/main.min.js"
    ],
    indicators: [
        {
            id: "fps-indicator",
            label: "FPS"
        }
    ],
    canvas: {
        width: 512,
        height: 512,
        enableFullscreen: true
    },
    controlsSections: [
        {
            title: "Gem",
            controls: [
                {
                    type: Demopage.supportedControls.ColorPicker,
                    title: "Color",
                    id: "gem-color-picker-id",
                    defaultValueHex: "#FF0000",
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Absorption",
                    id: "absorbtion-range-id",
                    min: 0,
                    max: 10,
                    value: 1,
                    step: 0.1
                },
            ],
        },
        {
            title: "Display",
            controls: [
                {
                    type: Demopage.supportedControls.ColorPicker,
                    title: "Background",
                    id: "background-color-picker-id",
                    defaultValueHex: "#000000",
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Indicators",
                    id: "display-indicators-checkbox-id",
                    checked: true,
                },
            ]
        },
        {
            title: "Debug",
            controls: [
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Display normals",
                    id: "display-normals-checkbox-id",
                    checked: false,
                },
            ]
        }
    ]
};

const SRC_DIR = path.resolve(__dirname);
const DEST_DIR = path.resolve(__dirname, "..", "docs");
const minified = true;

const buildResult = Demopage.build(data, DEST_DIR, {
    debug: !minified,
});

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.join(SRC_DIR, "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);

fse.copySync(path.join(SRC_DIR, "resources", "script"), path.join(DEST_DIR, "script"));
