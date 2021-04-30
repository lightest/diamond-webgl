import { Gemstone } from "./gemstone";
import { Shader } from "./gl-utils/shader";
import * as ShaderManager from "./gl-utils/shader-manager";
import { VBO } from "./gl-utils/vbo";
import { OrbitalCamera } from "./orbital-camera";
import { Parameters } from "./parameters";

import "./page-interface-generated";

declare const mat4: any;


const UNIT_CUBE = new Float32Array([
    -.5, -.5, -.5,
    +.5, -.5, -.5,
    -.5, -.5, +.5,
    +.5, -.5, -.5,
    +.5, -.5, +.5,
    -.5, -.5, +.5,

    +.5, -.5, -.5,
    +.5, +.5, -.5,
    +.5, -.5, +.5,
    +.5, +.5, -.5,
    +.5, +.5, +.5,
    +.5, -.5, +.5,

    -.5, -.5, +.5,
    +.5, -.5, +.5,
    -.5, +.5, +.5,
    +.5, -.5, +.5,
    +.5, +.5, +.5,
    -.5, +.5, +.5,

    -.5, +.5, -.5,
    -.5, +.5, +.5,
    +.5, +.5, -.5,
    +.5, +.5, -.5,
    -.5, +.5, +.5,
    +.5, +.5, +.5,

    -.5, -.5, -.5,
    -.5, -.5, +.5,
    -.5, +.5, -.5,
    -.5, +.5, -.5,
    -.5, -.5, +.5,
    -.5, +.5, +.5,

    -.5, -.5, -.5,
    -.5, +.5, -.5,
    +.5, -.5, -.5,
    +.5, -.5, -.5,
    -.5, +.5, -.5,
    +.5, +.5, -.5,
]);


const REFRACTION_INDEX_AIR = 1.0;

class Drawer {
    private readonly gl: WebGLRenderingContext;
    private readonly cubeVBO: VBO;
    private readonly pMatrix: number[];
    private readonly mvpMatrix: number[];

    private readonly camera: OrbitalCamera;

    private gemstone: Gemstone;

    private geometryVBO: WebGLBuffer;
    private shader: Shader;

    private raytracedVolumeShader: Shader;

    public constructor(gl: WebGLRenderingContext) {
        Page.Canvas.showLoader(true);

        this.gl = gl;
        this.cubeVBO = new VBO(gl, UNIT_CUBE, 3, gl.FLOAT, true);

        this.geometryVBO = gl.createBuffer();

        this.pMatrix = mat4.create();
        this.mvpMatrix = mat4.create();
        this.camera = new OrbitalCamera([0, 0, 0], 1.8);
        this.camera.phi = 1.1;
        this.camera.theta = 2;

        const EPSILON = 0.002;
        const minPhi = EPSILON;
        const maxPhi = Math.PI - EPSILON;
        Page.Canvas.Observers.mouseDrag.push((dX: number, dY: number) => {
            this.camera.theta -= 0.5 * 2 * 3.14159 * dX;
            this.camera.phi -= 0.5 * 2 * 3 * dY;
            this.camera.phi = Math.min(maxPhi, Math.max(minPhi, this.camera.phi));
            this.updateMVPMatrix();
        });

        const minDist = 1.8;
        const maxDist = 8;
        Page.Canvas.Observers.mouseWheel.push((delta: number) => {
            let d = this.camera.distance + 0.2 * delta;
            d = Math.min(maxDist, Math.max(minDist, d));
            this.camera.distance = d;
            this.updateMVPMatrix();
        });
        this.updateMVPMatrix();

        Page.Canvas.Observers.canvasResize.push(() => {
            this.updateMVPMatrix();
        });

        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        function updateBackgroundColor(): void {
            const backgroundColor = Parameters.backgroundColor;
            gl.clearColor(backgroundColor.r / 255, backgroundColor.g / 255, backgroundColor.b / 255, 1);
        }
        Parameters.addBackgroundColorObserver(updateBackgroundColor);
        updateBackgroundColor();

        const recomputeShader = () => { this.recomputeShader(); };
        Parameters.addRecomputeShaderObservers(recomputeShader);
    }

    public setGemstone(gemstone: Gemstone): void {
        this.gemstone = gemstone;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometryVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, gemstone.bufferData, this.gl.STATIC_DRAW);

        this.recomputeShader();
        this.recomputeRaytracedVolumeShader();

        Page.Canvas.setIndicatorText("triangles-count-indicator", gemstone.nbTriangles.toString());
        Page.Canvas.setIndicatorText("facets-count-indicator", gemstone.facets.length.toString());
    }

    public draw(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        if (this.shader && this.gemstone) {
            Page.Canvas.showLoader(false);

            const gemColor = Parameters.gemColor;
            const gemAbsorption = Parameters.absorption;
            const refractionIndexGem = Parameters.refractionIndex;

            this.shader.u["uMVPMatrix"].value = this.mvpMatrix;
            this.shader.u["uEyePosition"].value = this.camera.eyePos;
            if (this.shader.u["uAbsorption"]) {
                // when ray depth = 0, this uniform is unused and some drivers delete it, so protect this access
                this.shader.u["uAbsorption"].value = [
                    gemAbsorption * (1 - gemColor.r / 255),
                    gemAbsorption * (1 - gemColor.g / 255),
                    gemAbsorption * (1 - gemColor.b / 255),
                ];
            }
            this.shader.u["uDisplayNormals"].value = Parameters.displayNormals ? 1 : 0;
            this.shader.u["uRefractionInfo"].value = [
                refractionIndexGem / REFRACTION_INDEX_AIR,
                (refractionIndexGem / REFRACTION_INDEX_AIR < 1) ? Math.cos(Math.asin(refractionIndexGem / REFRACTION_INDEX_AIR)) : -1,
                REFRACTION_INDEX_AIR / refractionIndexGem,
                (REFRACTION_INDEX_AIR / refractionIndexGem < 1) ? Math.cos(Math.asin(REFRACTION_INDEX_AIR / refractionIndexGem)) : -1,
            ];
            this.shader.u["uDisplayReflection"].value = Parameters.displayReflection ? 1 : 0;
            this.shader.u["uASETSkybox"].value = Parameters.asetSkybox ? 1 : 0;

            this.shader.use();


            const BYTES_PER_FLOAT = 4;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometryVBO);
            const aPositionLoc = this.shader.a["aPosition"].loc;
            this.gl.enableVertexAttribArray(aPositionLoc);
            this.gl.vertexAttribPointer(aPositionLoc, 3, this.gl.FLOAT, false, 2 * 3 * BYTES_PER_FLOAT, 0);

            const aNormalLoc = this.shader.a["aNormal"].loc;
            this.gl.enableVertexAttribArray(aNormalLoc);
            this.gl.vertexAttribPointer(aNormalLoc, 3, this.gl.FLOAT, false, 2 * 3 * BYTES_PER_FLOAT, 3 * BYTES_PER_FLOAT);

            this.shader.bindUniformsAndAttributes();
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3 * this.gemstone.nbTriangles);
        }
    }

    public drawDebugVolume(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        if (this.raytracedVolumeShader && this.gemstone) {
            Page.Canvas.showLoader(false);

            this.raytracedVolumeShader.a["aPosition"].VBO = this.cubeVBO;
            this.raytracedVolumeShader.u["uMVPMatrix"].value = this.mvpMatrix;
            this.raytracedVolumeShader.u["uEyePosition"].value = this.camera.eyePos;

            this.raytracedVolumeShader.use();
            this.raytracedVolumeShader.bindUniformsAndAttributes();
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3 * 2 * 6);
        }
    }

    private updateMVPMatrix(): void {
        mat4.perspective(this.pMatrix, 45, Page.Canvas.getAspectRatio(), 0.1, 100.0);
        mat4.multiply(this.mvpMatrix, this.pMatrix, this.camera.viewMatrix);
    }

    private recomputeShader(): void {
        if (this.gemstone) {
            const facetsDefinitionInstructions: string[] = [];
            const computeInternalIntersectionInstructions: string[] = [];
            for (let i = 0; i < this.gemstone.facets.length; i++) {
                const facet = this.gemstone.facets[i];
                const facetPointName = `FACET_${i}_POINT`;
                const facetNormalName = `FACET_${i}_NORMAL`;

                facetsDefinitionInstructions.push(`const vec3 ${facetPointName} = vec3(${facet.point.x},${facet.point.y},${facet.point.z});`);
                facetsDefinitionInstructions.push(`const vec3 ${facetNormalName} = vec3(${facet.normal.x},${facet.normal.y},${facet.normal.z});`);

                computeInternalIntersectionInstructions.push(`checkNextInternalIntersection(${facetPointName}, ${facetNormalName}, position, direction, theta, facetNormal);`);
            }

            ShaderManager.buildShader({
                fragmentFilename: "shader.frag",
                vertexFilename: "shader.vert",
                injected: {
                    FACETS_DEFINITION: facetsDefinitionInstructions.join("\n"),
                    COMPUTE_INTERNAL_INTERSECTION: computeInternalIntersectionInstructions.join("\n\t"),
                    RAY_DEPTH: Parameters.rayDepth.toString(),
                },
            }, (builtShader: Shader | null) => {
                Page.Canvas.showLoader(false);
                if (this.shader) {
                    this.shader.freeGLResources();
                    this.shader = undefined;
                }

                if (builtShader !== null) {
                    this.shader = builtShader;
                } else {
                    Page.Demopage.setErrorMessage(`shader_load_fail`, `Failed to load/build the shader.`);
                }
            });
        }
    }

    private recomputeRaytracedVolumeShader(): void {
        if (this.gemstone) {
            const facetsDefinitionInstructions: string[] = [];
            const computeEntryPointInstructions: string[] = [];
            const checkIfInsideInstructions: string[] = [];
            for (let i = 0; i < this.gemstone.facets.length; i++) {
                const facet = this.gemstone.facets[i];
                const facetPointName = `FACET_${i}_POINT`;
                const facetNormalName = `FACET_${i}_NORMAL`;

                facetsDefinitionInstructions.push(`const vec3 ${facetPointName} = vec3(${facet.point.x},${facet.point.y},${facet.point.z});`);
                facetsDefinitionInstructions.push(`const vec3 ${facetNormalName} = vec3(${facet.normal.x},${facet.normal.y},${facet.normal.z});`);

                computeEntryPointInstructions.push(`computeIntersectionWithPlane(${facetPointName}, ${facetNormalName}, eyePosition, fromEyeNormalized, theta, facetNormal);`);
                checkIfInsideInstructions.push(`isInside(${facetPointName}, ${facetNormalName}, entryPoint)`);
            }

            ShaderManager.buildShader({
                fragmentFilename: "raytracedVolume.frag",
                vertexFilename: "raytracedVolume.vert",
                injected: {
                    FACETS_DEFINITION: facetsDefinitionInstructions.join("\n"),
                    COMPUTE_ENTRY_POINT: computeEntryPointInstructions.join("\n\t"),
                    CHECK_IF_INSIDE: checkIfInsideInstructions.join(" && "),
                },
            }, (builtShader: Shader | null) => {
                Page.Canvas.showLoader(false);
                if (this.raytracedVolumeShader) {
                    this.raytracedVolumeShader.freeGLResources();
                    this.raytracedVolumeShader = undefined;
                }

                if (builtShader !== null) {
                    this.raytracedVolumeShader = builtShader;
                } else {
                    Page.Demopage.setErrorMessage(`shader_load_fail`, `Failed to load/build the shader.`);
                }
            });
        }
    }
}

export { Drawer };
