import { cardColor, hoverForEdgeCreate } from "src/config/colors";
import { appActions, proposedEdgeSrc } from "src/state/stores";
import { derived, type Readable } from "svelte/store";
import { ElementType, createBaseElement, type BaseElement } from "./element";

export interface BaseBlock extends BaseElement {
  readonly type: ElementType;
  surfaceColor: Readable<string>;
}

export const createBaseBlock = () => {
  const baseElement = createBaseElement();
  return {
    ...baseElement,
    surfaceColor: derived(
      [baseElement.isHovered, proposedEdgeSrc, appActions.addEdge_.store],
      ([$isHovered, $proposedEdgeSrc, $addingEdge]) => {
        if ($proposedEdgeSrc == baseElement.id || ($addingEdge && $isHovered)) {
          return hoverForEdgeCreate;
        }
        return cardColor;
      }
    ),
  };
};
