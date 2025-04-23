import {ExtensibleEvent} from "./ExtensibleEvent.ts";
import {M_STREAM_END, StreamEndEventContent} from "../@types/streams.ts";
import {MessageEvent} from "./MessageEvent.ts";
import {
    type ExtensibleEventType,
    IPartialEvent,
    isEventTypeSame, M_TEXT,
    REFERENCE_RELATION
} from "../@types/extensible_events.ts";
import {InvalidEventError} from "./InvalidEventError.ts";

export class StreamEndEvent extends ExtensibleEvent<StreamEndEventContent> {
    /**
     * The poll start event ID referenced by the response.
     */
    public readonly streamEventId: string;

    /**
     * The closing message for the event.
     */
    public readonly closingMessage: MessageEvent;

    /**
     * Creates a new PollEndEvent from a pure format. Note that the event is *not*
     * parsed here: it will be treated as a literal m.poll.response primary typed event.
     * @param wireFormat - The event.
     */
    public constructor(wireFormat: IPartialEvent<StreamEndEventContent>) {
        super(wireFormat);

        const rel = this.wireContent["m.relates_to"];
        if (!REFERENCE_RELATION.matches(rel?.rel_type) || typeof rel?.event_id !== "string") {
            throw new InvalidEventError("Relationship must be a reference to an event");
        }

        this.streamEventId = rel.event_id;
        this.closingMessage = new MessageEvent(this.wireFormat);
    }

    public isEquivalentTo(primaryEventType: ExtensibleEventType): boolean {
        return isEventTypeSame(primaryEventType, M_STREAM_END);
    }

    public serialize(): IPartialEvent<object> {
        return {
            type: M_STREAM_END.name,
            content: {
                "m.relates_to": {
                    rel_type: REFERENCE_RELATION.name,
                    event_id: this.streamEventId,
                },
                [M_STREAM_END.name]: {},
                ...this.closingMessage.serialize().content,
            },
        };
    }

    /**
     * Creates a new PollEndEvent from a poll event ID.
     * @param streamEventId - The poll start event ID.
     * @param message - A closing message, typically revealing the top answer.
     * @returns The representative poll closure event.
     */
    public static from(streamEventId: string, message: string): StreamEndEvent {
        return new StreamEndEvent({
            type: M_STREAM_END.name,
            content: {
                "m.relates_to": {
                    rel_type: REFERENCE_RELATION.name,
                    event_id: streamEventId,
                },
                [M_STREAM_END.name]: {},
                [M_TEXT.name]: message,
            },
        });
    }
}
