import { cloneDeep, get, set } from "lodash-es";
import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import {
  getNumericFiled,
  getSelectField,
  getTextField,
} from "../../inputs/input-utils";
import { updateSlide } from "../../store/actions/actions";
import { ISlide } from "../../store/reducers/i-slides";
import { IStore } from "../../store/store";

import css from "./SlideSettingsPanel.module.scss";
import { getInputForm } from "../../inputs/input-factory";
// import { getRealSlideDuration } from "../../utils/utils";
import { EasingOptions } from "../../animations/types";
import {
  getAppAnimationDefinition,
  getAnimationsOptions,
} from "../../webslider-sdk/src/animations/animations-register";

type ISlideSettingsPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    slideId: string;
  };

const SlidesPanel: React.FC<ISlideSettingsPanel> = (props) => {
  const { slide, settings, _updateSlide } = props;

  /*const overlapInput = () => (
    <div className="input60">
      {getNumericFiled(
        "Overlap",
        get(slide, "slideTransition.overlap"),
        (value: any) => {
          const obj = cloneDeep(slide);
          set(obj!, "slideTransition.overlap", value);
          _updateSlide(obj as any as ISlide);
        }
      )}
    </div>
  );*/

  const durationInput = () => (
    <div className="input60">
      {getNumericFiled(
        "Transition duration",
        get(slide, "slideTransition.duration"),
        (value: any) => {
          const obj = cloneDeep(slide);
          set(obj!, "slideTransition.duration", value);
          _updateSlide(obj as any as ISlide);
        }
      )}
    </div>
  );

  const renderAnimationForm = (
    animationId: string,
    object: ISlide,
    valuesPath: string
  ) => {
    const animationDefinition = getAppAnimationDefinition(animationId);

    return animationDefinition?.formDefinition.form.map((item: any) => {
      function onChange(value: any) {
        const retObj = cloneDeep(object);
        if (retObj) {
          const values = get(retObj, valuesPath) || {};
          values[item.propertyName] = value;
          set(retObj, valuesPath, values);

          _updateSlide(retObj as any as ISlide);
        }
      }

      const value = get(object, valuesPath)[item.propertyName];
      const defaultValue = animationDefinition.formDefaults[item.propertyName];
      const inputProps = {
        ...item,
        value: typeof value !== "undefined" ? value : defaultValue,
      };
      return getInputForm(item.inputType, inputProps, onChange, onChange);
    });
  };

  if (!slide) return null;

  const effDef = getAppAnimationDefinition(
    get(slide, `slideTransition.animation.id`)
  );

  return (
    <div className={cx("bp3-dark", css.slideSettings)}>
      <div className={css.slidePanel} key={slide?.id}>
        <div className={css.slideHeader}>
          <div>
            SLIDE PROPERTIES
            <span className={css.slideName}>
              {slide && " [ " + slide.name + " ] "}
            </span>
          </div>
        </div>
        <div className={css.slidePropertiesHolder}>
          {/*getSelectField(
            "Type",
            slide.slideType,
            SlideTypeOptions,
            (value: string) => {
              const obj = cloneDeep(slide);
              obj.slideType = value as SlideType;
              _updateSlide(obj);
            }
          )*/}
          {getTextField(
            "Id",
            slide.customId,
            (value: string) => {
              const obj = cloneDeep(slide);
              obj.customId = value;
              _updateSlide(obj as any as ISlide);
            },
            "",
            { placeholder: "Enter slide ID" }
          )}
          {/* {getSelectField(
            "Duration",
            slide.duration.inheritFrom,
            SlideDurationOptions,
            (value: "inherit" | "custom") => {
              const obj = cloneDeep(slide);
              obj.duration.inheritFrom = value;
              _updateSlide(obj);
            }
          )} */}
          {/* {getUnitNumericFiled(
            " ",
            getRealSlideDuration(slide, settings),
            (value: string) => {
              const obj = cloneDeep(slide);
              obj.duration.customValue = value;
              _updateSlide(obj as any as ISlide);
            },
            undefined,
            { disabled: slide.duration.inheritFrom === "inherit" },
            ["ms", "s"]
          )} */}
          {getSelectField(
            "Transition",
            get(slide, `slideTransition.animation.id`),
            getAnimationsOptions("slide"),
            (value: any) => {
              const obj = cloneDeep(slide);
              set(obj, `slideTransition.animation.id`, value);

              const values = get(obj, `slideTransition.animation.values`) || {};
              const effDef = getAppAnimationDefinition(value);
              effDef?.formDefinition.form.forEach((item: any) => {
                values[item.propertyName] =
                  effDef.formDefaults[item.propertyName];
              });
              set(obj, `slideTransition.animation.values`, values);

              _updateSlide(obj as any as ISlide);
            }
          )}
          <div>
            {/*overlapInput()*/}
            {durationInput()}
          </div>
          {effDef?.formDefaults.hasEase &&
            getSelectField(
              "Easing",
              get(slide, "slideTransition.animation.values.ease"),
              EasingOptions,
              (value: any) => {
                const newSlide = cloneDeep(slide);
                set(newSlide, `slideTransition.animation.values.ease`, value);
                _updateSlide(newSlide);
              }
            )}
          <div className={css.dynamicFields}>
            {renderAnimationForm(
              get(slide, `slideTransition.animation.id`),
              slide,
              `slideTransition.animation.values`
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, selection, settings } = state.project;
  let slide: ISlide | null = null;

  if (selection.activeSlideId) {
    slide = slides.slideById[selection.activeSlideId];
  }

  return {
    slide,
    settings,
  };
};

const mapDispatchToProps = {
  _updateSlide: (slide: ISlide) => updateSlide(slide),
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
