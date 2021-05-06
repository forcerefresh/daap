import { cloneDeep, get, set } from "lodash-es";
import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import { getNumericFiled, getSelectField } from "../../inputs/input-utils";
import { updateSlide } from "../../store/actions/actions";
import { ISlide } from "../../store/reducers/slides";
import { IStore } from "../../store/store";

import css from "./SlideSettingsPanel.module.scss";
import { getEffectDefinition, getEffectsOptions } from "../../effects/effects";
import { getInputForm } from "../../inputs/input-factory";

type ISlideSettingsPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    slideId: string;
  };

const SlidesPanel: React.FC<ISlideSettingsPanel> = (props) => {
  const { slide, _updateSlide } = props;

  const overlapInput = () => (
    <div className="input60">
      {getNumericFiled(
        "Overlap",
        get(slide, "slideTransition.overlap"),
        (value: any) => {
          const obj = cloneDeep(slide);
          set(obj!, "slideTransition.overlap", value);
          _updateSlide((obj as any) as ISlide);
        }
      )}
    </div>
  );

  const durationInput = () => (
    <div className="input60">
      {getNumericFiled(
        "Duration",
        get(slide, "slideTransition.duration"),
        (value: any) => {
          const obj = cloneDeep(slide);
          set(obj!, "slideTransition.duration", value);
          _updateSlide((obj as any) as ISlide);
        }
      )}
    </div>
  );

  const renderEffectForm = (
    effectId: string,
    object: ISlide,
    valuesPath: string
  ) => {
    const effectDefinition = getEffectDefinition(effectId);

    return effectDefinition.definition.form.map((item) => {
      function onChange(value: any) {
        const retObj = cloneDeep(object);
        if (retObj) {
          const values = get(retObj, valuesPath) || {};
          values[item.propertyName] = value;
          set(retObj, valuesPath, values);

          _updateSlide((retObj as any) as ISlide);
        }
      }

      const value = get(object, valuesPath)[item.propertyName];
      const defaultValue = effectDefinition.defaults[item.propertyName];
      const inputProps = {
        ...item,
        value: typeof value !== "undefined" ? value : defaultValue,
      };
      return getInputForm(item.inputType, inputProps, onChange, onChange);
    });
  };

  if (!slide) return null;

  return (
    <>
      <div className={cx("bp3-dark", css.slideSettings)}>
        {getSelectField(
          "Slide transition",
          get(slide, `slideTransition.effect.id`),
          getEffectsOptions(),
          (value: any) => {
            const obj = cloneDeep(slide);
            set(obj, `slideTransition.effect.id`, value);

            const values = get(obj, `slideTransition.effect.values`) || {};
            const effDef = getEffectDefinition(value);
            effDef.definition.form.forEach((item) => {
              values[item.propertyName] = effDef.defaults[item.propertyName];
            });
            set(obj, `slideTransition.effect.values`, values);

            _updateSlide((obj as any) as ISlide);
          }
        )}

        <div className={css.inlineFlex}>
          {overlapInput()}
          {durationInput()}
        </div>

        <div className={css.dynamicFields}>
          {renderEffectForm(
            get(slide, `slideTransition.effect.id`),
            slide,
            `slideTransition.effect.values`
          )}
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides, selection } = state.project;
  let slide: ISlide | null = null;

  if (selection.activeSlideId) {
    slide = slides.slideById[selection.activeSlideId];
  }

  return {
    slide,
  };
};

const mapDispatchToProps = {
  _updateSlide: (slide: ISlide) => updateSlide(slide),
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidesPanel);
