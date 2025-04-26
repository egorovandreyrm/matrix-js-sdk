import { type EitherAnd, UnstableValue } from "matrix-events-sdk";

import {
    type ExtensibleAnyMessageEventContent,
    type REFERENCE_RELATION,
    type RelatesToRelationship,
} from "./extensible_events.ts";
import { type EmptyObject } from "./common.ts";

/**
 * The namespaced value for m.stream.start
 */
export const M_STREAM_START = new UnstableValue("m.stream.start", "org.matrix.msc3381.stream.start");

/**
 * The m.stream.start type within event content
 */
export type StreamStartSubtype = {
    description: ExtensibleAnyMessageEventContent;
    stream_app: ExtensibleAnyMessageEventContent;
    stream_id: ExtensibleAnyMessageEventContent;
    third_party: boolean;
};


/**
 * The event definition for an m.poll.start event (in content)
 */
export type StreamStartEvent = EitherAnd<
    { [M_STREAM_START.name]: StreamStartSubtype },
    { [M_STREAM_START.altName]: StreamStartSubtype }
>;

/**
 * The content for an m.poll.start event
 */
export type StreamStartEventContent = StreamStartEvent & ExtensibleAnyMessageEventContent;

/**
 * The namespaced value for m.poll.end
 */
export const M_STREAM_END = new UnstableValue("m.stream.end", "org.matrix.msc3381.stream.end");

/**
 * The event definition for an m.poll.end event (in content)
 */
export type StreamEndEvent = EitherAnd<{ [M_STREAM_END.name]: EmptyObject }, { [M_STREAM_END.altName]: EmptyObject }>;

/**
 * The content for an m.poll.end event
 */
export type StreamEndEventContent = StreamEndEvent &
    RelatesToRelationship<typeof REFERENCE_RELATION> &
    ExtensibleAnyMessageEventContent;
