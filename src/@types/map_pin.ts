import {
    type ExtensibleAnyMessageEventContent,
    type TSNamespace,
} from "./extensible_events.ts";

export const M_MAPPIN_TYPE_PIN = "m.pin";
export const M_MAPPIN_TYPE_TRACKER = "m.tracker";

export type MapPinType = TSNamespace<typeof M_MAPPIN_TYPE_PIN> | TSNamespace<typeof M_MAPPIN_TYPE_TRACKER> | string;

export type KnownMapPinType = (typeof M_MAPPIN_TYPE_PIN) | (typeof M_MAPPIN_TYPE_TRACKER);

export const M_MAP_PIN = "m.map_pin";

export type MapPinSubtype = {
    type: MapPinType;
    id: number;
    name: string;
};

/**
 * The event definition for an m.map_pin event (in content)
 */
export type MapPinEvent = { [M_MAP_PIN]: MapPinSubtype };

/**
 * The content for an m.map_pin event
 */
export type MapPinEventContent = MapPinEvent & ExtensibleAnyMessageEventContent;
