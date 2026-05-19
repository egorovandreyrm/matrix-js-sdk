import { MessageEvent } from "./MessageEvent.ts";
import { type ExtensibleEventType, type IPartialEvent, isEventTypeSame, M_TEXT } from "../@types/extensible_events.ts";
import { M_MAP_PIN, type MapPinEventContent, type MapPinType } from "../@types/map_pin.ts";
import { InvalidEventError } from "./InvalidEventError.ts";
import { ExtensibleEvent } from "./ExtensibleEvent.ts";

/**
 * Represents a map pin event.
 */
export class MapPinEvent extends ExtensibleEvent<MapPinEventContent> {
    /**
     * The text fallback representation of the map pin.
     */
    public readonly text: MessageEvent;

    /**
     * The type of the map pin.
     */
    public readonly pinType: MapPinType;

    /**
     * The ID of the map pin.
     */
    public readonly id: number;

    /**
     * The name of the map pin.
     */
    public readonly name: string;

    /**
     * Creates a new MapPinEvent from a pure format. Note that the event is *not*
     * parsed here: it will be treated as a literal m.map_pin primary typed event.
     * @param wireFormat - The event.
     */
    public constructor(wireFormat: IPartialEvent<MapPinEventContent>) {
        super(wireFormat);

        const mapPin = this.wireContent[M_MAP_PIN];

        if (!mapPin?.type) {
            throw new InvalidEventError("A type is required");
        }

        if (mapPin?.id == null) {
            throw new InvalidEventError("An id is required");
        }

        if (!mapPin?.name) {
            throw new InvalidEventError("A name is required");
        }

        this.pinType = mapPin.type;
        this.id = mapPin.id;
        this.name = mapPin.name;
        this.text = new MessageEvent(this.wireFormat);
    }

    public isEquivalentTo(primaryEventType: ExtensibleEventType): boolean {
        return isEventTypeSame(primaryEventType, M_MAP_PIN);
    }

    public serialize(): IPartialEvent<object> {
        return {
            type: M_MAP_PIN,
            content: {
                [M_MAP_PIN]: {
                    type: this.pinType,
                    id: this.id,
                    name: this.name,
                },
                [M_TEXT.name]: this.text.text,
            },
        };
    }

    public static from(name: string, id: number, pinType: MapPinType): MapPinEvent {
        return new MapPinEvent({
            type: M_MAP_PIN,
            content: {
                [M_TEXT.name]: name, // unused by parsing
                [M_MAP_PIN]: {
                    type: pinType,
                    id: id,
                    name: name,
                },
            },
        });
    }
}
