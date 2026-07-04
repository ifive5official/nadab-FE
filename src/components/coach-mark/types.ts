export type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
};

export type HighlightRect = Rect & {
  stepId: string;
};

export type AnchorModalPosition = {
  stepId: string;
  offset: number;
  rect: Rect;
};
