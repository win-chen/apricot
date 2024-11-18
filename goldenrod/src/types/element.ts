import { v4 } from "uuid";
import { createInteractable, type Interactable } from "./interactable";
import { defaultPositionable, type Positionable } from "./positionable";

export interface BaseElement extends Interactable, Positionable {
  readonly id: string;
}

export const createBaseElement = (): BaseElement => {
  const id = v4();
  return {
    id,
    ...createInteractable(id),
    ...defaultPositionable(),
  };
};
export enum ElementType {
  TEXT,
  IMAGE,
  CONTAINER,
}
