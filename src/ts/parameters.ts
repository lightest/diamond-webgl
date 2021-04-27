import "./page-interface-generated";

/* === IDs ============================================================ */
const controlId = {
    GEM_COLOR_PICKER: "gem-color-picker-id",
    GEM_ABSOPTION_RANGE_ID: "absorbtion-range-id",
    BACKGROUND_COLOR_PICKER: "background-color-picker-id",
    DISPLAY_INDICATORS: "display-indicators-checkbox-id",
    DISPLAY_NORMALS: "display-normals-checkbox-id",
};

type Observer = () => unknown;

function updateIndicatorsVisibility(): void {
    const visible = Page.Checkbox.isChecked(controlId.DISPLAY_INDICATORS);
    Page.Canvas.setIndicatorsVisibility(visible);
}
updateIndicatorsVisibility();
Page.Checkbox.addObserver(controlId.DISPLAY_INDICATORS, updateIndicatorsVisibility);

interface IRGB {
    r: number;
    g: number;
    b: number;
}

const backgroundColorChangeObservers: Observer[] = [];
const backgroundColor: IRGB = { r: 0, g: 0, b: 0 };
function updateBackgroundColor(): void {
    const rgb = Page.ColorPicker.getValue(controlId.BACKGROUND_COLOR_PICKER);
    backgroundColor.r = rgb.r;
    backgroundColor.g = rgb.g;
    backgroundColor.b = rgb.b;

    for (const observer of backgroundColorChangeObservers) {
        observer();
    }
}
Page.ColorPicker.addObserver(controlId.BACKGROUND_COLOR_PICKER, updateBackgroundColor);
updateBackgroundColor();

const gemColor: IRGB = { r: 0, g: 0, b: 0 };
function updateGemColor(): void {
    const rgb = Page.ColorPicker.getValue(controlId.GEM_COLOR_PICKER);
    gemColor.r = rgb.r;
    gemColor.g = rgb.g;
    gemColor.b = rgb.b;
}
Page.ColorPicker.addObserver(controlId.GEM_COLOR_PICKER, updateGemColor);
updateGemColor();

abstract class Parameters {
    public static get backgroundColor(): IRGB {
        return backgroundColor;
    }

    public static get gemColor(): IRGB {
        return gemColor;
    }

    public static get absorption(): number {
        return Page.Range.getValue(controlId.GEM_ABSOPTION_RANGE_ID);
    }

    public static get displayNormals(): boolean {
        return Page.Checkbox.isChecked(controlId.DISPLAY_NORMALS);
    }

    public static addBackgroundColorObserver(observer: Observer): void {
        backgroundColorChangeObservers.push(observer);
    }
}

export {
    Parameters,
};
