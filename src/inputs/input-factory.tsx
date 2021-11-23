import React from "react";
import { IObject } from "../objects/types";
import { BorderColorInputForm } from "./border-color-input/border-color-input";
import { ILayer } from "../store/reducers/i-layers";
import { CheckboxInputForm } from "./checkbox-input/checkbox-input";
import { ColorInputForm } from "./color-input/color-input";
import { CornerRadiusInputForm } from "./corner-radius-input/corner-radius-input";
import { CoverPlacementInputForm } from "./cover-placement/cover-placement";
import { EventsInputForm } from "./events-input/events-input";
import { FontSelectInputForm } from "./font-input/font-input";
import { GridPlacementInputForm } from "./grid-placement/grid-placement";
import { ImageInputForm } from "./image-input/image-input";
import { NumberInputForm } from "./number-input/number-input";
import { NumbericTimelineInputForm as NumericTimelineInputForm } from "./numberic-timeline-input/numeric-timeline-input";
import { ParallaxInputForm } from "./parallax-input/parallax-input";
import { SelectInputForm } from "./select-input/select-input";
import { SplitInputForm } from "./split-input/split-input";
import { TextInputForm } from "./text-input/text-input";
import { TextStartPositionInputForm } from "./text-start-position-input/text-start-position-input";
import { TextAreaInputForm } from "./textarea-input/textarea-input";
import { TransformInputForm } from "./transform-input/transform-input";
import { TransformOriginInputForm } from "./transform-origin/transform-origin";
import { InputType } from "./types";
import { UnitsNumberInputForm } from "./units-number-input/units-number-input";
import { VideoInputForm } from "./video-input/video-input";
import { ColorArrayInputForm } from "./color-array-input/color-array-input";
import { ColorArrayInputPresetForm } from "./color-array-input-preset/color-array-input-preset";
import { CSSPointsInputForm } from "./css-plugin-input/css-plugin-input";

export function getInputForm<T>(
  inputType: InputType,
  inputProps: T | any,
  onChange: (config: any) => void,
  onInput?: (config: any) => void,
  data?: {
    layerData?: {
      layer?: ILayer;
      objects?: IObject[];
    };
  }
): React.ReactElement | undefined {
  const key = inputProps.propertyName || inputProps.id;

  switch (inputType) {
    case InputType.NUMBER: {
      return (
        <NumberInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.UNITS_NUMBER: {
      return (
        <UnitsNumberInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.NUMERIC_TIMELINE: {
      return (
        <NumericTimelineInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.BORDER_COLOR: {
      return (
        <BorderColorInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.COLOR_ARRAY: {
      return (
        <ColorArrayInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.CSS_POINTS: {
      return (
        <CSSPointsInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.COLOR_ARRAY_PRESETS: {
      return (
        <ColorArrayInputPresetForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.TEXT: {
      return <TextInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.TEXTAREA: {
      return <TextAreaInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.IMAGE: {
      return <ImageInputForm key={key} {...inputProps} onChange={onChange} />;
    }

    case InputType.VIDEO: {
      return <VideoInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.TRANSFORM_ORIGIN: {
      return (
        <TransformOriginInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
        />
      );
    }
    case InputType.COLOR: {
      return <ColorInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.SELECT: {
      return <SelectInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.FONT_SELECT: {
      return (
        <FontSelectInputForm key={key} {...inputProps} onChange={onChange} />
      );
    }
    case InputType.TRANSFORM: {
      return (
        <TransformInputForm key={key} {...inputProps} onChange={onChange} />
      );
    }
    case InputType.COVER_LAYOUT: {
      return (
        <CoverPlacementInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
        />
      );
    }
    case InputType.GRID_LAYOUT: {
      return (
        <GridPlacementInputForm key={key} {...inputProps} onChange={onChange} />
      );
    }
    case InputType.CHECKBOX: {
      return (
        <CheckboxInputForm key={key} {...inputProps} onChange={onChange} />
      );
    }
    case InputType.EVENTS: {
      return <EventsInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.SPLIT: {
      return <SplitInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.PARALLAX: {
      return (
        <ParallaxInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          layerData={data?.layerData}
        />
      );
    }
    case InputType.TEXT_START_POSITION: {
      return (
        <TextStartPositionInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
        />
      );
    }
    case InputType.CORNER_RADIUS: {
      return (
        <CornerRadiusInputForm key={key} {...inputProps} onChange={onChange} />
      );
    }
  }
}
