import React from "react";
import { IObject } from "../objects/types";
import { ILayer } from "../store/reducers/layers";
import { ISlide } from "../store/reducers/slides";
import { CheckboxInputForm } from "./checkbox-input/checkbox-input";
import { ColorInputForm } from "./color-input/color-input";
import { CoverPlacementInputForm } from "./cover-placement/cover-placement";
import { EventsInputForm } from "./events-input/events-input";
import { FontSelectInputForm } from "./font-input/font-input";
import { ImageInputForm } from "./image-input/image-input";
import { NumberInputForm } from "./number-input/number-input";
import { ParallaxInputForm } from "./parallax-input/parallax-input";
import { SelectInputForm } from "./select-input/select-input";
import { SplitInputForm } from "./split-input/split-input";
import { TextInputForm } from "./text-input/text-input";
import { TextAreaInputForm } from "./textarea-input/textarea-input";
import { TransformInputForm } from "./transform-input/transform-input";
import { TransformOriginInputForm } from "./transform-origin/transform-origin";
import { InputType } from "./types";
import { UnitsNumberInputForm } from "./units-number-input/units-number-input";
import { VideoInputForm } from "./video-input/video-input";

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
    case InputType.TEXT: {
      return <TextInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.TEXTAREA: {
      return <TextAreaInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.IMAGE: {
      return <ImageInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.COVER_PLACEMENT: {
      return (
        <CoverPlacementInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
        />
      );
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
  }
}
