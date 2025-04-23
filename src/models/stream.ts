import type {MatrixEvent} from "./event.ts";
import {TypedEventEmitter} from "./typed-event-emitter.ts";
import type {Room} from "./room.ts";
import {StreamStartEvent} from "../extensible_events_v1/StreamStartEvent.ts";
import {M_STREAM_END, M_STREAM_START} from "../@types/streams.ts";

export enum StreamEvent {
    New = "Stream.new",
    End = "Stream.end",
    Update = "Stream.update",
    Destroy = "Stream.Destroy",
    UndecryptableRelations = "Stream.UndecryptableRelations",
}

export type StreamEventHandlerMap = {
    [StreamEvent.Update]: (event: MatrixEvent, stream: Stream) => void;
    [StreamEvent.Destroy]: (pollIdentifier: string) => void;
    [StreamEvent.End]: () => void;
    [StreamEvent.UndecryptableRelations]: (count: number) => void;
};

export class Stream extends TypedEventEmitter<Exclude<StreamEvent, StreamEvent.New>, StreamEventHandlerMap> {
    public readonly roomId: string;
    public readonly streamEvent: StreamStartEvent;
    private endEvent: MatrixEvent | undefined;
    /**
     * Keep track of undecryptable relations
     * As incomplete result sets affect stream results
     */
    private undecryptableRelationEventIds = new Set<string>();

    public constructor(
        public readonly rootEvent: MatrixEvent,
        private room: Room,
    ) {
        super();
        if (!this.rootEvent.getRoomId() || !this.rootEvent.getId()) {
            throw new Error("Invalid stream start event.");
        }
        this.roomId = this.rootEvent.getRoomId()!;
        this.streamEvent = this.rootEvent.unstableExtensibleEvent as unknown as StreamStartEvent;
    }

    public get streamId(): string {
        return this.rootEvent.getId()!;
    }

    public get endEventId(): string | undefined {
        return this.endEvent?.getId();
    }

    public get isEnded(): boolean {
        return !!this.endEvent;
    }

    public get undecryptableRelationsCount(): number {
        return this.undecryptableRelationEventIds.size;
    }

    /**
     *
     * @param event - event with a relation to the rootEvent
     * @returns void
     */
    public onNewRelation(event: MatrixEvent): void {
        if (M_STREAM_END.matches(event.getType()) && this.validateEndEvent(event)) {
            this.endEvent = event;
            this.emit(StreamEvent.End);
        }

        this.countUndecryptableEvents([event]);
    }

    private countUndecryptableEvents = (events: MatrixEvent[]): void => {
        const undecryptableEventIds = events
            .filter((event) => event.isDecryptionFailure())
            .map((event) => event.getId()!);

        const previousCount = this.undecryptableRelationsCount;
        this.undecryptableRelationEventIds = new Set([...this.undecryptableRelationEventIds, ...undecryptableEventIds]);

        if (this.undecryptableRelationsCount !== previousCount) {
            this.emit(StreamEvent.UndecryptableRelations, this.undecryptableRelationsCount);
        }
    };

    private validateEndEvent(endEvent?: MatrixEvent): boolean {
        if (!endEvent) {
            return false;
        }
        /**
         * Repeated end events are ignored -
         * only the first (valid) closure event by origin_server_ts is counted.
         */
        if (this.endEvent && this.endEvent.getTs() < endEvent.getTs()) {
            return false;
        }

        /**
         * MSC3381
         * If a m.poll.end event is received from someone other than the poll creator or user with permission to redact
         * others' messages in the room, the event must be ignored by clients due to being invalid.
         */
        const roomCurrentState = this.room.currentState;
        const endEventSender = endEvent.getSender();
        return (
            !!endEventSender &&
            (endEventSender === this.rootEvent.getSender() ||
                roomCurrentState.maySendRedactionForEvent(this.rootEvent, endEventSender))
        );
    }
}

/**
 * Tests whether the event is a start, response or end poll event.
 *
 * @param event - Event to test
 * @returns true if the event is a poll event, else false
 */
export const isStreamEvent = (event: MatrixEvent): boolean => {
    const eventType = event.getType();
    return M_STREAM_START.matches(eventType) || M_STREAM_END.matches(eventType);
};
