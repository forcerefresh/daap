import React from "react";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BorderColorInputForm } from "./border-color-input/border-color-input";
import { ILayer } from "../store/reducers/i-layers";
import { CheckboxInputForm } from "./checkbox-input/checkbox-input";
import { ColorInputForm } from "./color-input/color-input";
import { CornerRadiusInputForm } from "./corner-radius-input/corner-radius-input";
import { CoverPlacementInputForm } from "./cover-placement/cover-placement";
import { FontSelectInputForm } from "./font-input/font-input";
import { GridPlacementInputForm } from "./grid-placement/grid-placement";
import { ImageInputForm } from "./image-input/image-input";
import { NumberInputForm } from "./number-input/number-input";
import { NumericTimelineInputForm } from "./numberic-timeline-input/numeric-timeline-input";
import { ParallaxInputForm } from "./parallax-input/parallax-input";
import { SelectInputForm } from "./select-input/select-input";
import { SplitInputForm } from "./split-input/split-input";
import { TextInputForm } from "./text-input/text-input";
import { TextStartPositionInputForm } from "./text-start-position-input/text-start-position-input";
import { TextAreaInputForm } from "./textarea-input/textarea-input";
import { AbsolutePlacementForm } from "./absolute-placement/absolute-placement-input";
import { TransformOriginInputForm } from "./transform-origin/transform-origin";
import {
  IInputMetadataValues,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import { UnitsNumberInputForm } from "./units-number-input/units-number-input";
import { VideoInputForm } from "./video-input/video-input";
import { ColorArrayInputForm } from "./color-array-input/color-array-input";
//import { ColorArrayInputPresetForm } from "./color-array-input-preset/color-array-input-preset";
import { TimelinesInputForm } from "./transform-input/transform-input";
import { RelativeRotationInputForm } from "./relative-rotation-input/relative-rotation-input";
import { RelativePositionInputForm } from "./relative-position-input/relative-position-input";
import { SliderInputForm } from "./slider-input/slider-input";
import { ButtonGroupInputForm } from "./buttonGroupInput/button-group-input";
import { BoxInputForm } from "./box-input/box-input";
import { RichTextAreaInputForm } from "./rich-textarea-input/rich-textarea-input";
import { SVGTextAreaInputForm } from "./svg-textarea-input/svg-textarea-input";
import { MultiImageInputForm } from "./multi-image-input/multi-image-input";
import { SVGInputForm } from "./svg-input/svg-input";
import { SVGCustomColorsForm } from "./svg-custom-colors-input/svg-custom-colors-input";
import { OptionalInput } from "./optional-input/optional-input";
import { SizeInputForm } from "./size-input/size-input";
import { SnapInputForm } from "./snap-input/snap-input";
import { LayoutChildrenInputForm } from "./layout-children-input/layout-children-input";
import { Breakpoints } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { InheritableTimeInputForm } from "./slide-duration-input/slide-duration-input";
import { InfoInputForm } from "./info-input/info-input";
import { BorderInputForm } from "./border-input/border-input";
import { SizePosInputForm } from "./size-pos-input/size-pos-input";
import { SizeUnitInputForm } from "./size-unit-input/size-unit-input";
import { HTMLInputForm } from "./html-input/html-input";
import { RangeSliderInputForm } from "./range-slider-input/range-slider-input";

export function getInputFormWithOptions<T>(
  inputType: InputType,
  inputProps: T | any,
  onChange: (config: any) => void,
  onInput?: (config: any) => void,
  onMetadataChange?: (metadata: IInputMetadataValues) => void,
  data?: {
    layerData?: {
      layer?: ILayer;
      objects?: IObject[];
    };
    breakpoints?: Breakpoints;
    selectedDevice?: string;
    onChangeDevice?: (device: string) => void;
  }
): React.ReactElement | undefined {
  console.log("OPTIONS");
  console.log(data);

  // force DISABLED if metadata.disabled===true
  if (inputProps?.metadata?.disabled) {
    if (!inputProps.inputProps) inputProps.inputProps = {};
    inputProps.inputProps.disabled = true;
  }

  const input = getInputForm(inputType, inputProps, onChange, onInput, data);

  if (inputProps.optional) {
    return (
      <OptionalInput
        metadataValues={inputProps.metadata}
        onMetadataChange={onMetadataChange || (() => {})}
      >
        {input}
      </OptionalInput>
    );
  }
  return input;
}
export function getInputForm<T>(
  inputType: InputType,
  inputProps: T | any,
  onChange: (config: any) => void,
  onInput?: (config: any) => void,
  data?: {
    layerData?: {
      layer?: ILayer | null;
      objects?: IObject[] | null;
    };
    breakpoints?: Breakpoints;
    selectedDevice?: string;
    onChangeDevice?: (device: string) => void;
  }
): React.ReactElement | undefined {
  console.log("GET");
  console.log(data);
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
    case InputType.BORDER: {
      return (
        <BorderInputForm
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
    case InputType.TIMELINES: {
      return (
        <TimelinesInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.RELATIVE_POSITION_INPUT: {
      return (
        <RelativePositionInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.RELATIVE_ROTATION_INPUT: {
      return (
        <RelativeRotationInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.SLIDER_INPUT: {
      return (
        <SliderInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.RANGE_SLIDER_INPUT: {
      return (
        <RangeSliderInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    case InputType.BUTTON_GROUP_INPUT: {
      return (
        <ButtonGroupInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          onInput={onInput}
        />
      );
    }
    // case InputType.COLOR_ARRAY_PRESETS: {
    //   return (
    //     <ColorArrayInputPresetForm
    //       key={key}
    //       {...inputProps}
    //       onChange={onChange}
    //       onInput={onInput}
    //     />
    //   );
    // }
    case InputType.TEXT: {
      return <TextInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.TEXTAREA: {
      return <TextAreaInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.SVG_TEXTAREA: {
      return (
        <SVGTextAreaInputForm key={key} {...inputProps} onInput={onChange} />
      );
    }
    case InputType.SVG_INPUT: {
      return <SVGInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.HTML_INPUT: {
      return <HTMLInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.SVG_CUSTOM_COLORS: {
      return (
        <SVGCustomColorsForm key={key} {...inputProps} onChange={onChange} />
      );
    }
    case InputType.INFO: {
      return <InfoInputForm key={key} {...inputProps} onInput={onChange} />;
    }
    case InputType.RICH_TEXTAREA: {
      return (
        <RichTextAreaInputForm key={key} {...inputProps} onInput={onChange} />
      );
    }
    case InputType.IMAGE: {
      return <ImageInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.MULTI_IMAGE: {
      return (
        <MultiImageInputForm key={key} {...inputProps} onChange={onChange} />
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
    case InputType.ABSOLUTE_LAYOUT: {
      return (
        <AbsolutePlacementForm
          key={key}
          {...inputProps}
          onChange={onChange}
          breakpoints={data?.breakpoints}
          selectedDevice={data?.selectedDevice}
          onChangeDevice={data?.onChangeDevice}
        />
      );
    }
    case InputType.LAYOUT_CHILDREN: {
      return (
        <LayoutChildrenInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          layerData={data?.layerData}
        />
      );
    }
    case InputType.SIZE: {
      return <SizeInputForm key={key} {...inputProps} onChange={onChange} />;
    }

    case InputType.SIZE_UNIT: {
      return (
        <SizeUnitInputForm key={key} {...inputProps} onChange={onChange} />
      );
    }
    case InputType.SIZE_POS: {
      return <SizePosInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.SNAP: {
      return (
        <SnapInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          breakpoints={data?.breakpoints}
          selectedDevice={data?.selectedDevice}
          onChangeDevice={data?.onChangeDevice}
        />
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
        <GridPlacementInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
          breakpoints={data?.breakpoints}
          selectedDevice={data?.selectedDevice}
          onChangeDevice={data?.onChangeDevice}
        />
      );
    }
    case InputType.CHECKBOX: {
      return (
        <CheckboxInputForm key={key} {...inputProps} onChange={onChange} />
      );
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
    case InputType.BOX: {
      return <BoxInputForm key={key} {...inputProps} onChange={onChange} />;
    }
    case InputType.INHERIT_TIME: {
      return (
        <InheritableTimeInputForm
          key={key}
          {...inputProps}
          onChange={onChange}
        />
      );
    }
  }
}
