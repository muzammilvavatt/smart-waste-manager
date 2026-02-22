/**
 * Points awarded to citizens for each type of verified waste.
 * Adjusted to incentivize harder-to-process items like hazardous waste.
 */
export const WASTE_POINTS = {
    organic: 10,
    plastic: 15,
    metal: 20,
    paper: 10,
    hazardous: 25,
    general: 5,
    non_waste: 0,
};

/**
 * Default map center coordinates [lat, lng].
 * Centered on Mavoor, Calicut for specific user demo.
 */
export const DEFAULT_MAP_CENTER: [number, number] = [11.2472, 75.9228];

/** Default zoom level for the map view. */
export const DEFAULT_MAP_ZOOM = 15;

/**
 * Bounds for the map to restrict view to TIGHT Mavoor/Calicut region.
 * Approximately 5-10km radius to prevent seeing other states/districts.
 */
export const MAP_BOUNDS: [[number, number], [number, number]] = [
    [11.2000, 75.8800], // South West
    [11.3000, 75.9800]  // North East
];

/** Minimum zoom level allowed - prevents zooming out too far */
export const MIN_ZOOM = 13;

/** List of valid waste categories recognized by the system. */
export const WASTE_CATEGORIES = [
    'organic',
    'plastic',
    'metal',
    'paper',
    'hazardous',
    'general',
] as const;

export type WasteCategory = keyof typeof WASTE_POINTS;
