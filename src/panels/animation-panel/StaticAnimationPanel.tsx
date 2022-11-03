import { cloneDeep } from "lodash-es";
import React from "react";
import { connect } from "react-redux";
import {
  getCheckboxField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";
import { updateSlide } from "../../store/actions/actions";
import { ISlide } from "../../store/reducers/i-slides";
import { IStore } from "../../store/store";
import AnimationPanelTabs from "./AnimationPanelTabs";
import css from "./AnimationPanelTabs.module.scss";

type IStaticAnimationPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    hideHeader?: boolean;
    className?: string;
  };

const StaticAnimationPanel: React.FC<IStaticAnimationPanel> = (props) => {
  const {
    slideById,
    selectionForProperties,
    hideHeader,
    className,
    _updateSlide,
  } = props;

  const itemType = selectionForProperties?.type;
  const id = selectionForProperties?.id!;

  const getEnableSlideTransitionCheckbox = () => {
    const slide = slideById[id];

    return getCheckboxField(
      "Enable slide transition",
      slide.transitionEnabled,
      (value: boolean) => {
        const newItem = cloneDeep(slide);
        newItem.transitionEnabled = value;
        _updateSlide(newItem);
      },
      "",
      { alignIndicator: "left" }
    );
  };

  let slideForm = <></>;
  if (itemType === "slide") {
    const slide = slideById[id];

    if (!slide.transitionEnabled) {
      return (
        <div className={css.enableSlideHolder}>
          {getEnableSlideTransitionCheckbox()}
        </div>
      );
    }
    slideForm = (
      <div className={css.enableSlideHolder}>
        {getEnableSlideTransitionCheckbox()}

        {getUnitNumericFiled(
          "Overlap",
          slide.transitionOverlapTime,
          (value: any) => {
            const newItem = cloneDeep(slide);
            newItem.transitionOverlapTime = value;
            _updateSlide(newItem);
          },
          "",
          { style: { width: "90px" } },
          ["ms", "s"]
        )}

        {getUnitNumericFiled(
          "Duration",
          slide.transitionDurationTime,
          (value: any) => {
            const newItem = cloneDeep(slide);
            newItem.transitionDurationTime = value;
            _updateSlide(newItem);
          },
          "",
          { style: { width: "90px" } },
          ["ms", "s"]
        )}
      </div>
    );
    if (!slide.transitionEnabled) {
      return slideForm;
    }
  }

  return (
    <>
      {slideForm}
      <AnimationPanelTabs
        id={selectionForProperties?.id}
        itemType={selectionForProperties?.type}
        hideHeader={hideHeader}
        className={className}
      />
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { slides } = state.project;

  const selectionForProperties = state.project.selection.selectionForProperties;

  return { selectionForProperties, slideById: slides.slideById };
};

const mapDispatchToProps = {
  _updateSlide: (slide: ISlide) => updateSlide(slide),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StaticAnimationPanel);
