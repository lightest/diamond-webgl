import "./page-interface-generated";

/* === IDs ============================================================ */
const controlId = {
    BACKGROUND_COLOR_PICKER: "background-color-picker-id",
    DISPLAY_INDICATORS: "display-indicators-checkbox-id",
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


abstract class Parameters {
    public static get backgroundColor(): IRGB {
        return backgroundColor;
    }
    public static addBackgroundColorObserver(observer: Observer): void {
        backgroundColorChangeObservers.push(observer);
    }
}

export {
    Parameters,
};
