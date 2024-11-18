import { createBaseBlock, type BaseBlock } from "./base-block";
import { ElementType } from "./element";

export interface TextBlock extends BaseBlock {
  readonly type: ElementType.TEXT;
}

const createTextBlock = (text: string) => {
  const block = createBaseBlock();
  return {
    ...block,
    type: ElementType.TEXT,
    text,
  };
};
