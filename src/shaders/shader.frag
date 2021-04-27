#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 uEyePosition;
uniform vec3 uAbsorption;
uniform float uDisplayNormals;
uniform float uRefractionIndex;

varying vec3 vPosition; // in [-0.5,+0.5]^3

#define MAX 0.49

#INJECT(FACETS_DEFINITION)

void computeIntersectionWithPlane(const vec3 planePoint, const vec3 planeNormal, const vec3 startingPoint, const vec3 startingDirection, inout float currentTheta, inout vec3 currentNormal) {
    float b = dot(startingDirection, planeNormal);
    if (b < 0.0) {
        float theta = dot(planePoint - startingPoint, planeNormal) / b;

        if (theta > 0.0 && currentTheta < theta) {
            vec3 finalPosition = startingPoint + theta * startingDirection;
            if (abs(finalPosition.x) < MAX && abs(finalPosition.y) < MAX && abs(finalPosition.z) < MAX) {
                currentTheta = theta;
                currentNormal = planeNormal;
            }
        }
    }
}

bool isInside(const vec3 planePoint, const vec3 planeNormal, const vec3 position) {
    return dot(planePoint - position, planeNormal) >= -0.00001;
}

void computeEntryPoint(const vec3 eyePosition, const vec3 fromEyeNormalized, out vec3 entryPoint, out vec3 facetNormal) {
    float theta = -1.0;

    #INJECT(COMPUTE_ENTRY_POINT)

    if (theta < 0.0) {
        discard;
    }

    entryPoint = uEyePosition + theta * fromEyeNormalized;
    if (!(#INJECT(CHECK_IF_INSIDE))) {
        discard;
    }
}

float checkNextInternalIntersection(const vec3 planePoint, const vec3 planeNormal, const vec3 position, const vec3 direction, out float theta, out vec3 facetNormal) {
    float localTheta = 100000.0;
    float b = dot(direction, planeNormal);
    if (b > 0.0) {
        localTheta = dot(planePoint - position, planeNormal) / b;

        if (localTheta < theta) {
            facetNormal = planeNormal;
            theta = localTheta;
        }
    }
    return theta;
}

float computeInternalIntersection(const vec3 position, const vec3 direction, out vec3 facetNormal) {
    float theta = 100000.0;
    #INJECT(COMPUTE_INTERNAL_INTERSECTION)
    return theta;
}

vec4 sampleSkybox(const vec3 direction) {
    return vec4(vec3(step(0.7, direction.z) * step(direction.z, 0.8)), 1);
}

// external to internal
float computeFresnelReflection(const vec3 incidentRay, const vec3 surfaceNormal, const vec3 refractedRay) {
    float cosIncident = abs(dot(-surfaceNormal, incidentRay));
    float cosRefracted = abs(dot(surfaceNormal, refractedRay));

    float etaCosRefracted = uRefractionIndex * cosRefracted;
    float etaCosIncident = uRefractionIndex * cosIncident;

    float a = (cosIncident - etaCosRefracted) / (cosIncident + etaCosRefracted);
    float b = (etaCosIncident - cosRefracted) / (etaCosIncident + cosRefracted);
    return 0.5 * (a * a + b * b);
}

void main(void) {
    if (abs(vPosition.x) >= MAX && abs(vPosition.y) >= MAX && abs(vPosition.z) >= MAX) {
        gl_FragColor = vec4(vec3(1, 0, 0), 1);
        return;
    }

    vec3 fromEyeNormalized = normalize(vPosition - uEyePosition);

    vec3 entryPoint;
    vec3 entryFacetNormal;
    computeEntryPoint(uEyePosition, fromEyeNormalized, entryPoint, entryFacetNormal);
    vec3 entryRefractedRay = refract(fromEyeNormalized, entryFacetNormal, 1.0 / uRefractionIndex);

    vec3 currentPoint = entryPoint;
    vec3 currentDirection = entryRefractedRay;
    float totalDepthInside = 0.0;

    vec4 insideColor  = vec4(vec3(1), 0);

    const int rayDepth = #INJECT(RAY_DEPTH);
    for (int i = 0; i < rayDepth; i ++) {
        vec3 facetNormal;
        float theta = computeInternalIntersection(currentPoint, currentDirection, facetNormal);

        totalDepthInside += theta;
        currentPoint += theta * currentDirection;
        currentDirection = reflect(currentDirection, facetNormal);
    }

    vec4 normalAsColor = vec4(vec3(0.5 + 0.5 * entryFacetNormal), 1);
    insideColor = mix(insideColor, normalAsColor, uDisplayNormals) + 0.000000001 * uAbsorption.x;

    // vec4 color = vec4(exp(- uAbsorption * totalDepthInside), 1);

    vec3 entryReflectedRay = reflect(fromEyeNormalized, entryFacetNormal);
    vec4 reflectedColor = sampleSkybox(entryReflectedRay);

    float fresnelReflection = computeFresnelReflection(fromEyeNormalized, entryFacetNormal, entryRefractedRay);
    gl_FragColor = mix(normalAsColor, reflectedColor, fresnelReflection);
}