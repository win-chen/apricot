import type { BaseBlock } from "./base-block";
import type { BaseElement, ElementType } from "./element";
import type { TextBlock } from "./text-block";

// See graph for basecontainer's children
interface BaseContainer extends BaseElement {
  readonly type: ElementType.CONTAINER;
}

// If we ever need to render anything for a stack such as highlighting, this can be rendered as an element underneath its children
// We can always render a hitbox
export interface BlockStack extends BaseContainer {}

export type Element = TextBlock | ImageBlock | BlockStack;

export interface ImageBlock extends BaseBlock {
  readonly type: ElementType.IMAGE;
}
