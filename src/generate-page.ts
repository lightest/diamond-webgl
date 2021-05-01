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
        },
        {
            id: "triangles-count-indicator",
            label: "Triangles"
        },
        {
            id: "facets-count-indicator",
            label: "Facets"
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
                    type: Demopage.supportedControls.Picker,
                    title: "Cut",
                    id: "gem-cut-picker-id",
                    placeholder: "Custom",
                    options: [
                        {
                            value: "cube.obj",
                            label: "Cube",
                            checked: true,
                        },
                        {
                            value: "CUSTOM CUT",
                            label: "Custom cut",
                            checked: true,
                        },
                        {
                            value: "brilliant_cut.obj",
                            label: "Brilliant cut"
                        },
                        {
                            value: "step_cut.obj",
                            label: "Step cut"
                        },
                        {
                            value: "brilliant_cut_triangle.obj",
                            label: "Brilliant cut triangle"
                        },
                        {
                            value: "oval_cut.obj",
                            label: "Oval"
                        },
                        {
                            value: "sphere.obj",
                            label: "Sphere"
                        },
                    ]
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Refraction",
                    id: "refraction-range-id",
                    min: 1,
                    max: 3,
                    value: 2.42,
                    step: 0.01
                },
                {
                    type: Demopage.supportedControls.ColorPicker,
                    title: "Color",
                    id: "gem-color-picker-id",
                    defaultValueHex: "#FF0000",
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Absorption",
                    id: "absorption-range-id",
                    min: 0,
                    max: 10,
                    value: 1,
                    step: 0.1
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Ray depth",
                    id: "ray-depth-range-id",
                    min: 0,
                    max: 20,
                    value: 5,
                    step: 1
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Reflection",
                    id: "reflection-checkbox-id",
                    checked: true,
                },
            ],
        },
        {
            title: "Proportions",
            id: "custom-cut-section",
            controls: [
                {
                    type: Demopage.supportedControls.Range,
                    title: "Crown height",
                    id: "custom-cut-crown-height-range-id",
                    min: 0,
                    max: 0.4,
                    value: 0.16,
                    step: 0.01
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Crown table",
                    id: "custom-cut-crown-table-range-id",
                    min: 0,
                    max: 1,
                    value: 0.53,
                    step: 0.01
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Crown ratio",
                    id: "custom-cut-crown-ratio-range-id",
                    min: 0,
                    max: 1,
                    value: 0.5,
                    step: 0.01
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Girdle thickness",
                    id: "custom-cut-girdle-thickness-range-id",
                    min: 0,
                    max: 0.1,
                    value: 0.02,
                    step: 0.001
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Girdle roundness",
                    id: "custom-cut-girdle-roundness-range-id",
                    min: 0,
                    max: 3,
                    value: 1,
                    step: 1
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Pavillion height",
                    id: "custom-cut-pavillion-height-range-id",
                    min: 0.1,
                    max: 0.5,
                    value: 0.43,
                    step: 0.01
                },
                {
                    type: Demopage.supportedControls.Range,
                    title: "Pavillion ratio",
                    id: "custom-cut-pavillion-ratio-range-id",
                    min: 0,
                    max: 1,
                    value: 0.75,
                    step: 0.01
                },
            ]
        },
        {
            title: "Rendering",
            controls: [
                {
                    type: Demopage.supportedControls.ColorPicker,
                    title: "Background",
                    id: "background-color-picker-id",
                    defaultValueHex: "#000000",
                },
                {
                    type: Demopage.supportedControls.Tabs,
                    title: "Projection",
                    id: "projection-tabs-id",
                    unique: true,
                    options: [
                        {
                            value: "perspective",
                            label: "Perspective",
                            checked: true,
                        },
                        {
                            value: "orthographic",
                            label: "Orthographic"
                        },
                    ]
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "High DPI",
                    id: "high-dpi-checkbox-id",
                    checked: false,
                },
            ]
        },
        {
            title: "Lighting",
            controls: [
                {
                    type: Demopage.supportedControls.Tabs,
                    title: "Type",
                    id: "light-type-tabs-id",
                    unique: true,
                    options: [
                        {
                            value: "white",
                            label: "White",
                            checked: true,
                        },
                        {
                            value: "aset",
                            label: "ASET"
                        },
                    ]
                },
                {
                    type: Demopage.supportedControls.Tabs,
                    title: "From",
                    id: "light-direction-tabs-id",
                    unique: true,
                    options: [
                        {
                            value: "downward",
                            label: "Top",
                            checked: true,
                        },
                        {
                            value: "upward",
                            label: "Bottom"
                        },
                    ]
                }
            ]
        },
        {
            title: "Debug",
            controls: [
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Raytraced volume",
                    id: "raytraced-volume-checkbox-id",
                    checked: false,
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Display normals",
                    id: "display-normals-checkbox-id",
                    checked: false,
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Indicators",
                    id: "display-indicators-checkbox-id",
                    checked: true,
                },
                {
                    type: Demopage.supportedControls.Checkbox,
                    title: "Verbose",
                    id: "verbose-checkbox-id",
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
fse.copySync(path.join(SRC_DIR, "resources", "models"), path.join(DEST_DIR, "models"));
