/** App State ===== */

import type { Node } from "src/gql/graphql"

/* Generic enum for representing init states */
export enum InitState {
    INITIALIZING = "Initializing",
    SUCCESS = "Done",
    ERROR = "Error"
}

/* Generic enum for representing loading/fetching states */
export enum LoadingState {
    IDLE = "Idle",
    LOADING = "Loading",
    SUCCESS = "Done",
    ERROR = "Error"
}

export enum NodeInteraction {
    CLICK_SELECT,
    CLICK_EDGE_SRC,
    CLICK_CREATE_EDGE,
    CLICK_TO_EDIT,
    DOWN_DRAG_START,
    UP_DRAG_END,
}
