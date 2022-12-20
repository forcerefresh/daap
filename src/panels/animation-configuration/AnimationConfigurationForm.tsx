import { Alert, Button, Icon, Intent } from "@blueprintjs/core";
import classnames from "classnames";
import { cloneDeep, merge } from "lodash-es";
import React, { useState } from "react";
import { getInputForm } from "../../inputs/input-factory";
import {
  getInheritTimeField,
  getNumericFiled,
  getSelectField,
  getTextField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";
import {
  ILayer,
  IObject,
  ITransition,
} from "webslider-sdk/lib/objects/i-object";
import FormWithLayout, {
  flattenForm,
} from "../../utils/form-layout/form-layout";
import { IFormLayoutItem } from "webslider-sdk/lib/form/i-form-layout";

import css from "./AnimationConfigurationForm.module.scss";
import {
  getAppAnimationDefinition,
  getAnimationsOptions,
} from "webslider-sdk/lib/animations/animations-register";
import { Presets } from "../../utils/presets/Presets";
import {
  AnimeJSEasingOptions,
  EasingOptions,
  AnimationType,
} from "webslider-sdk/lib/animations/i-animation-types";
/*
type IAnimationConfigurationForm = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    objectOrLayerId: string;
    objectType?: "object" | "layer" | "slide";
    animationType: AnimationType;
  };*/

export interface IAnimationConfigurationForm {
  animationType: AnimationType;
  objectType?: string;
  transition: ITransition;
  onTransitionChange: (transition: ITransition) => void;
  onRemove: () => void;
  layer: ILayer | null;
  layerObjects: IObject[] | null;
}

export const AnimationConfigurationForm: React.FC<
  IAnimationConfigurationForm
> = (props) => {
  const {
    transition,
    animationType,
    objectType,
    onTransitionChange,
    onRemove,
    layer,
    layerObjects,
    /*objectOrLayerId: objectId,
    objectType,
    objectById,
    layerById,
    slideById,
    animationType,
    _updateObject,
    _updateLayer,
    _updateSlide,*/
  } = props;

  const [
    isRemoveAnimationConfirmationOpen,
    setIsRemoveAnimationConfirmationOpen,
  ] = useState(false);

  /*const objectOrLayer =
    objectType === "object"
      ? objectById[objectId]
      : objectType === "layer"
      ? layerById[objectId]
      : slideById[objectId];*/

  /*let layer: ILayer | undefined;
  let layerObjects: IObject[] | undefined;
  if (objectType === "layer") {
    layer = layerById[objectId];
    layerObjects = layer?.objectIds.map((id) => objectById[id]);
  }*/

  const renderAnimationForm = () => {
    const animationDefinition = getAppAnimationDefinition(
      transition.animation.id
    );

    const flatForm = flattenForm(
      animationDefinition?.formDefinition.form as IFormLayoutItem[]
    );

    const inputs = flatForm
      //.filter((item) => !item.formType || item.formType === FormType.INPUT)
      .map((item) => {
        function onChange(value: any) {
          const newTransition = cloneDeep(transition);
          (newTransition.animation.values as any)[item.propertyName] = value;
          onTransitionChange(newTransition);
          /*
          const retObj = cloneDeep(object);
          if (retObj) {
            const values = get(retObj, valuesPath) || {};
            values[item.propertyName] = value;
            set(retObj, valuesPath, values);
            if (objectType === "object")
              _updateObject(retObj as any as IObject);
            else if (objectType === "layer")
              _updateLayer(retObj as any as ILayer);
            else if (objectType === "slide")
              _updateSlide(retObj as any as ISlide);
          }*/
        }

        const value = (transition.animation.values as any)[item.propertyName];
        const defaultValue =
          animationDefinition?.formDefaults[item.propertyName];
        const inputProps = {
          ...item,
          value: typeof value !== "undefined" ? value : defaultValue,
        };
        return {
          input: getInputForm(item.inputType, inputProps, onChange, onChange, {
            layerData: {
              layer: layer,
              objects: layerObjects,
            },
          }),
          propertyName: item.propertyName,
          duplicate: "",
        };
      });

    return (
      <FormWithLayout
        values={transition.animation.values || {}}
        inputs={inputs}
        form={animationDefinition?.formDefinition.form as IFormLayoutItem[]}
        formId={`${animationType}_${animationDefinition?.formDefinition.id}`}
      />
    );

    //return inputs.map((item: any) => item.input);

    //if (!animationDefinition.formConfiguration) {
    //return inputs.map((item: any) => item.input);
    /*} else {
      return (
        <FormWithLayout
          values={get(object, valuesPath) || {}}
          inputs={inputs}
          formConfiguration={animationDefinition.formConfiguration}
        />
      );
    }*/
  };

  const effDef = (type: string) => {
    return getAppAnimationDefinition(transition.animation.id);
    /* return getAnimationDefinition(
      get(objectOrLayer, "transitions." + type + "[0].animation.id")
    );*/
  };

  /*const animationDefinition = getAnimationDefinition(
    get(objectOrLayer, "transitions.in.animation.id")
  );*/

  const delayInput = () => (
    <div className="">
      {getUnitNumericFiled(
        // animationType === "out" ? "Gap" : "Delay",
        "Delay",
        transition.delay,
        (value: string) => {
          const newTransition = cloneDeep(transition);
          newTransition.delay = value;
          onTransitionChange(newTransition);
        },
        "",
        { style: { width: "90px" } },
        ["ms", "s"]
      )}
    </div>
  );

  const durationInput = () => (
    <div className="">
      {getUnitNumericFiled(
        "Duration",
        transition.duration,
        (value: any) => {
          const newTransition = cloneDeep(transition);
          newTransition.duration = value;
          onTransitionChange(newTransition);
        },
        "",
        { style: { width: "90px" } },
        ["ms", "s"]
      )}
    </div>
  );

  const outAnimationStartInput = () => (
    <div className={css.inlineFlex}>
      {getInheritTimeField(
        "Exit",
        transition.outStartTime,
        [
          {
            label: "Use slides 'Exit' configuration",
            value: "inheritFromSlide",
          },
          { label: "Absolute time from beginning", value: "absolute" },
        ],
        (outStartTime: any) => {
          const newTransition = cloneDeep(transition);
          newTransition.outStartTime = outStartTime;
          onTransitionChange(newTransition);
        },
        null
      )}
    </div>
  );

  const eventInput = () => (
    <div className={css.inlineFlex}>
      {getSelectField(
        "Event",
        transition.event,
        [
          { label: "none", value: "" },
          { label: "Mouse click", value: "click" },
          { label: "Mouse enter", value: "mouseenter" },
          { label: "Mouse leave", value: "mouseleave" },
        ],
        (event: any) => {
          const newTransition = cloneDeep(transition);
          newTransition.event = event;
          onTransitionChange(newTransition);
        }
      )}
      {getTextField(
        "Target",
        transition.eventTargetId,
        (eventTargetId: any) => {
          const newTransition = cloneDeep(transition);
          newTransition.eventTargetId = eventTargetId;
          onTransitionChange(newTransition);
        },
        "",
        { style: { width: "100px" }, disabled: transition.event === "time" }
      )}
    </div>
  );

  const reverseEventInput = () => (
    <div className={css.inlineFlex}>
      {getSelectField(
        "Reverse",
        transition.reverseEvent,
        [
          { label: "none", value: "" },
          { label: "Mouse click", value: "click" },
          { label: "Mouse enter", value: "mouseenter" },
          { label: "Mouse leave", value: "mouseleave" },
        ],
        (reverseEvent: any) => {
          const newTransition = cloneDeep(transition);
          newTransition.reverseEvent = reverseEvent;
          onTransitionChange(newTransition);
        }
      )}
      {getTextField(
        "Target",
        transition.reverseEventTargetId,
        (reverseEventTargetId: any) => {
          const newTransition = cloneDeep(transition);
          newTransition.reverseEventTargetId = reverseEventTargetId;
          onTransitionChange(newTransition);
        },
        "",
        { style: { width: "100px" }, disabled: transition.event === "time" }
      )}
    </div>
  );

  const overlapInput = () => (
    <div className="">
      {getUnitNumericFiled(
        "Overlap",
        transition.overlap,
        (value: any) => {
          const newTransition = cloneDeep(transition);
          newTransition.overlap = value;
          onTransitionChange(newTransition);
        },
        "",
        { style: { width: "80px" } },
        ["ms", "s"]
      )}
    </div>
  );

  const selectedAnimationName = getAnimationsOptions(
    animationType,
    transition.canBeCombined
  ).find((item) => item.value === transition.animation.id)?.label;

  const useAnimeJs = effDef(animationType)?.formDefaults.library === "animejs";

  const animationExists = !!getAppAnimationDefinition(transition.animation.id);

  if (!animationExists) {
    return (
      <div>
        Animation '{transition.animation.id}' is not installed.
        <br />
        Go to Library &gt; Extensions (or My Extensions) to install missing
        extension.
      </div>
    );
  }

  return (
    <>
      <div className={css.animationConfigurationForm}>
        <div className={classnames(css.inlineFlex, css.selectAnimationRow)}>
          {getSelectField(
            transition.canBeCombined
              ? "Attribute Animation"
              : "Structural Animation",
            transition.animation.id,
            getAnimationsOptions(
              animationType,
              transition.canBeCombined,
              objectType
            ),
            (value: any) => {
              const newTransition = cloneDeep(transition);
              newTransition.animation.id = value;

              const values = (transition.animation.values || {}) as {
                [key: string]: any;
              };
              const effDef = getAppAnimationDefinition(value);
              const flatEffDef = flattenForm(
                effDef?.formDefinition.form as IFormLayoutItem[]
              );

              flatEffDef.forEach((item) => {
                values[item.propertyName] =
                  effDef?.formDefaults[item.propertyName];
              });
              newTransition.animation.values = values;

              onTransitionChange(newTransition);
            },
            { disabled: true }
          )}
          <div>
            <Button
              icon="delete"
              small
              minimal
              className={classnames(css.smallDelete)}
              onClick={() => {
                setIsRemoveAnimationConfirmationOpen(true);
              }}
            ></Button>
          </div>
        </div>

        <>
          {(animationType === "in" ||
            animationType === "animation" ||
            animationType === "layer") && (
            <>
              <div className={css.inlineFlex}>
                {effDef(animationType)?.formDefaults.hasDelay && delayInput()}
                {effDef(animationType)?.formDefaults.hasDuration &&
                  durationInput()}
              </div>
            </>
          )}

          {animationType === "out" && (
            <>
              {outAnimationStartInput()}
              <div className={css.inlineFlex}>
                {effDef(animationType)?.formDefaults.hasDelay && delayInput()}
                {effDef(animationType)?.formDefaults.hasDuration &&
                  durationInput()}
              </div>
            </>
          )}

          {animationType === "slide" && (
            <div className={css.inlineFlex}>
              {delayInput()}
              {effDef(animationType)?.formDefaults.hasDuration &&
                durationInput()}
            </div>
          )}

          {animationType === "event" && (
            <>
              <div className={css.inlineFlex}>
                {effDef(animationType)?.formDefaults.hasDelay && delayInput()}
                {effDef(animationType)?.formDefaults.hasDuration &&
                  durationInput()}
              </div>
              {eventInput()}
              {reverseEventInput()}
            </>
          )}
        </>

        {animationType === "animation" && (
          <div className="bp3-form-helper-text"></div>
        )}

        <Presets
          presetGroup={`animation-${transition.animation.id}`}
          currentValue={transition.animation.values}
          onChange={(presetValues) => {
            const newTransition = cloneDeep(transition);
            newTransition.animation.values = merge(
              newTransition.animation.values,
              presetValues
            );
            onTransitionChange(newTransition);
          }}
        />

        <div className={css.dynamicFields}>{renderAnimationForm()}</div>

        <div>
          {effDef(animationType)?.formDefaults.hasEase &&
            getSelectField(
              "Easing",
              transition.ease,
              useAnimeJs ? AnimeJSEasingOptions : EasingOptions,
              (value: any) => {
                const newTransition = cloneDeep(transition);
                newTransition.ease = value;
                onTransitionChange(newTransition);
              }
            )}
          {effDef(animationType)?.formDefaults.hasChildEase &&
            getSelectField(
              "Child easing",
              transition.childEase,
              useAnimeJs ? AnimeJSEasingOptions : EasingOptions,
              (value: any) => {
                const newTransition = cloneDeep(transition);
                newTransition.childEase = value;
                onTransitionChange(newTransition);
              }
            )}
          <div className="input60">
            {effDef(animationType)?.formDefaults.hasTimeDistribution &&
              getNumericFiled(
                "Time distribution",
                transition.timeDistribution,
                (value: any) => {
                  const newTransition = cloneDeep(transition);
                  newTransition.timeDistribution = value;
                  onTransitionChange(newTransition);
                },
                "Percentage that every item will take related to animation time (default 50%)"
              )}
          </div>
        </div>
      </div>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Remove"
        canOutsideClickCancel={false}
        icon={<Icon icon="info-sign" size={36} intent={Intent.WARNING} />}
        intent={Intent.PRIMARY}
        isOpen={isRemoveAnimationConfirmationOpen}
        onCancel={() => setIsRemoveAnimationConfirmationOpen(false)}
        onConfirm={() => {
          setIsRemoveAnimationConfirmationOpen(false);
          onRemove();
        }}
        className="bp3-dark"
      >
        <p>Remove "{selectedAnimationName}" animation from list?</p>
      </Alert>
    </>
  );
};
/*
const mapStateToProps = (state: IStore) => {
  const { objects, layers, slides } = state.project;
  return {
    objectById: objects.objectById,
    layerById: layers.layerById,
    slideById: slides.slideById,
  };
};

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _updateLayer: (layer: ILayer) => updateLayer(layer),
  _updateSlide: (slide: ISlide) => updateSlide(slide),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnimationConfigurationForm);*/
