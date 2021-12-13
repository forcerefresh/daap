export enum ObjectType {
  TEXT = "text",
  RICH_TEXT = "rich_text",
  IMAGE = "image",
  MULTI_IMAGE = "multi_image",
  VIDEO = "video",
  HTML = "html",
  SVG = "svg",
  CANVAS = "canvas",
  SOURCE_IMAGE = "source_image",
  FRAME = "frame",
  BUTTON = "button",
  BULLETS = "bullets",
}

export interface IDefinition {
  id: string;
  type: ObjectType;
  properties: any[];
  values: { [key: string]: any };
}

export interface ICommonObjectProperties {
  left?: number;
  leftType?: "px" | "em" | "%" | "vw" | "vh";
  top?: number;
  topType?: "px" | "em" | "%" | "vw" | "vh";
  right?: number;
  rightType?: "px" | "em" | "%" | "vw" | "vh";
  bottom?: number;
  bottomType?: "px" | "em" | "%" | "vw" | "vh";
  width?: number;
  widthType?: "px" | "em" | "%" | "vw" | "vh";
  height?: number;
  heightType?: "px" | "em" | "%" | "vw" | "vh";
}

export interface IAbsoluteLayout {
  left: number;
  width: number;
  top: number;
  height: number;
}

export interface ICoverLayout {
  // TODO
  tmp1: number;
}
export interface IGridLayout {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export interface IObject<T extends {} = {}> extends ICommonObjectProperties {
  id: string;
  name: string;
  layerId: string;
  type: ObjectType;
  isVisible: boolean;
  isLocked: boolean;
  supportedLayout: {
    cover: boolean;
    grid: boolean;
    absolute: boolean;
  };
  layout:
    | "absolute"
    | "grid"
    | "cover"
    | "fit_page"
    | "fit_stage"
    | "fit_guidelines";
  absoluteLayout?: IAbsoluteLayout;
  gridLayout?: IGridLayout;
  coverLayout?: ICoverLayout;
  isCoverPlacement?: boolean; // DEPRECIATED
  isGridPlacement?: boolean; // DEPRECIATED
  // hasTimeline: boolean; // show in timeline
  transitions: ITransitions;
  definition: IDefinition;
  events: IObjectEvent[];
  commonProperties?: {
    borderRadius?: {
      common?: string;
      tl?: string;
      tr?: string;
      bl?: string;
      br?: string;
    };
  };
}

export interface IObjectEvent {
  type?: "click" | "mouseenter" | "mouseleave"; //TODO add other
  action?: IGoToSlideAction | INavigateToUrlAction;
}
export interface IGoToSlideAction {
  action: "goToSlideAction";
  slideId?: number;
  slideLabel?: string;
}

export interface INavigateToUrlAction {
  action: "navigateToUrlAction";
  url?: number;
  target?: string;
}

export interface ITransitions {
  in?: ITransition;
  out?: ITransition;
  effect?: ITransition;
  layer?: ITransition;
}

export interface ITransition {
  relativeTo: "stage";
  delay: number;
  duration: number;
  timeDistribution?: number;
  ease?: string;
  childEase?: string;
  effect: IEffect;
  overlap?: number;
}

export interface ISlideTransition {
  overlap: number;
  duration: number;
  effect: IEffect;
}

export interface IEffect {
  id: string;
  values?: object;
  // properties?: object; // TODO to be defined
}
