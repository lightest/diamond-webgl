import { averagePoint, computeTriangleNormal, IHalfSpace, IPoint, ITriangle } from "./geometry";

const knownGemstones: {
    [name: string]: Gemstone | null; // null when requested but not loaded yet
} = {};

class Gemstone {
    public static loadGemstone(name: string, callback: (gemstone: Gemstone | null) => unknown): void {
        if (typeof knownGemstones[name] !== "undefined") {
            callback(knownGemstones[name]);
        } else {
            const request = new XMLHttpRequest();
            request.addEventListener("load", () => {
                if (request.status === 200) {
                    if (typeof knownGemstones[name] === "undefined") {
                        knownGemstones[name] = new Gemstone(request.responseText);
                    }
                    callback(knownGemstones[name]);
                } else {
                    callback(null);
                }
            });
            request.open("GET", `models/${name}`);
            request.send();
        }
    }

    public readonly facets: IHalfSpace[];
    public readonly bufferData: Float32Array;
    public readonly nbTriangles: number;

    private constructor(input: string) {
        const lines = input.split("\n");

        const vertices: IPoint[] = [];
        const triangles: ITriangle[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lineItems = line.split(/\s+/);
            const command = lineItems[0];

            if (command === "v") { // declare vertex
                if (lineItems.length >= 4) {
                    vertices.push({
                        x: parseFloat(lineItems[1]),
                        y: parseFloat(lineItems[2]),
                        z: parseFloat(lineItems[3]),
                    });
                } else {
                    console.log(`Ignoring line ${i} because it does not have enough items: '${line}'.`);
                    continue;
                }
            } else if (command === "f") { // declare face
                if (lineItems.length >= 4) {
                    // faces with more that 3 vertices are interpreted as TRIANGLE_FAN
                    for (let iV = 3; iV < lineItems.length; iV++) {
                        const indices: number[] = [
                            +(lineItems[1].split("/")[0]),
                            +(lineItems[iV - 1].split("/")[0]),
                            +(lineItems[iV].split("/")[0]),
                        ];

                        for (const indice of indices) {
                            if (indice < 1 || indice >= vertices.length) {
                                console.log(`Ignoring line ${i} because vertex index ${indice} is out of range: '${line}'.`);
                                continue;
                            }
                        }

                        triangles.push({
                            p1: vertices[indices[0] - 1],
                            p2: vertices[indices[1] - 1],
                            p3: vertices[indices[2] - 1],
                        });
                    }
                } else {
                    console.log(`Ignoring line ${i} because only triangular faces are supported: '${line}'.`);
                    continue;
                }
            } else {
                console.log(`Ignoring line ${i}: '${line}'.`);
                continue;
            }
        }

        this.nbTriangles = triangles.length;
        this.bufferData = Gemstone.buildBufferFromTriangles(triangles);
        this.facets = Gemstone.buildFacetsFromTriangles(triangles);
    }

    private static buildBufferFromTriangles(triangles: ITriangle[]): Float32Array {
        const nbFloatsPerTriangle = (3 + 3) * 3;
        const bufferData = new Float32Array(nbFloatsPerTriangle * triangles.length);
        let i = 0;
        for (const triangle of triangles) {
            const normal = computeTriangleNormal(triangle);

            bufferData[i++] = triangle.p1.x;
            bufferData[i++] = triangle.p1.y;
            bufferData[i++] = triangle.p1.z;
            bufferData[i++] = normal.x;
            bufferData[i++] = normal.y;
            bufferData[i++] = normal.z;
            bufferData[i++] = triangle.p2.x;
            bufferData[i++] = triangle.p2.y;
            bufferData[i++] = triangle.p2.z;
            bufferData[i++] = normal.x;
            bufferData[i++] = normal.y;
            bufferData[i++] = normal.z;
            bufferData[i++] = triangle.p3.x;
            bufferData[i++] = triangle.p3.y;
            bufferData[i++] = triangle.p3.z;
            bufferData[i++] = normal.x;
            bufferData[i++] = normal.y;
            bufferData[i++] = normal.z;
        }
        return bufferData;
    }

    private static buildFacetsFromTriangles(triangles: ITriangle[]): IHalfSpace[] {
        const result: IHalfSpace[] = [];
        for (const triangle of triangles) {
            result.push({
                point: averagePoint(triangle.p1, triangle.p2, triangle.p3),
                normal: computeTriangleNormal(triangle),
            });
        }
        return result;
    }
}

export { Gemstone };
