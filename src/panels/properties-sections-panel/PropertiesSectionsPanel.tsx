import { Button, Tag } from "@blueprintjs/core";
import React, { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import IdIcon from "./icons/id.svg?react";
import PropertiesIcon from "./icons/properties.svg?react";

import AnimationIcon from "./icons/animation.svg?react";
import LinkIcon from "./icons/link.svg?react";
import LayoutIcon from "./icons/layout.svg?react";
import TransformIcon from "./icons/transform.svg?react";
import CommonStyleIcon from "./icons/common-style.svg?react";
import {
  PropertiesPanelContext,
  PropertiesPanelSection,
} from "../properties-panel-all/PropertiesPanelProvider";

import css from "./PropertiesSectionsPanel.module.scss";

const ICON_SIZE = 28;

type IPropertiesSectionsPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const PropertiesSectionsPanel: React.FC<IPropertiesSectionsPanel> = (props) => {
  const { totalAnimationCounter, elementType, selectionForProperties } = props;

  const { activeSection, setActiveSection } = useContext(
    PropertiesPanelContext
  );

  useEffect(() => {
    if (selectionForProperties?.type !== "object") {
      setActiveSection(PropertiesPanelSection.Properties);
    }
  }, [selectionForProperties]);

  return (
    <div className={css.propertiesSections}>
      <div className={css.buttonGroupsHolder}>
        {/* <div>
          <Button
            minimal
            active={activeSection === PropertiesPanelSection.Layout}
            onClick={() => {
              setActiveSection(PropertiesPanelSection.Layout);
            }}
          >
            <LayoutIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
            <div>Layout</div>
          </Button>
        </div> */}
        <div>
          <Button
            minimal
            active={activeSection === PropertiesPanelSection.Properties}
            onClick={() => {
              setActiveSection(PropertiesPanelSection.Properties);
            }}
          >
            <PropertiesIcon
              style={{
                width: "36px",
                height: ICON_SIZE + "px",
                fill: "gray",
              }}
            />
            <div>Properties</div>
          </Button>
        </div>

        <div>
          {selectionForProperties?.type === "object" && (
            <Button
              minimal
              active={activeSection === PropertiesPanelSection.Transform}
              onClick={() => {
                setActiveSection(PropertiesPanelSection.Transform);
              }}
            >
              <TransformIcon
                style={{
                  width: "36px",
                  height: ICON_SIZE + "px",
                  fill: "gray",
                }}
              />
              <div>Transform</div>
            </Button>
          )}
        </div>

        {/* <div>
          <Button
            minimal
            active={activeSection === PropertiesPanelSection.Basic}
            onClick={() => {
              setActiveSection(PropertiesPanelSection.Basic);
            }}
          >
            <IdIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
            <div>Basic</div>
          </Button>
        </div> */}
        {/* <div>
          {selectionForProperties?.type === "object" && (
            <Button
              minimal
              active={activeSection === PropertiesPanelSection.Linking}
              onClick={() => {
                setActiveSection(PropertiesPanelSection.Linking);
              }}
            >
              <LinkIcon
                style={{
                  width: "36px",
                  height: ICON_SIZE + "px",
                  fill: "gray",
                }}
              />
              Link
            </Button>
          )}
        </div> */}
        {/* <div>
          <Button
            minimal
            active={activeSection === PropertiesPanelSection.Animation}
            onClick={() => {
              setActiveSection(PropertiesPanelSection.Animation);
            }}
          >
            <AnimationIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
            <div>{elementType === "slide" ? "Transitions" : "Animations"}</div>
            {totalAnimationCounter > 0 && (
              <Tag round intent="none" minimal className={css.tag}>
                {totalAnimationCounter}
              </Tag>
            )}
          </Button>
        </div> */}
        <div>
          {selectionForProperties?.type === "object" && (
            <Button
              minimal
              active={activeSection === PropertiesPanelSection.CommonStyle}
              onClick={() => {
                setActiveSection(PropertiesPanelSection.CommonStyle);
              }}
            >
              <CommonStyleIcon
                style={{
                  width: "36px",
                  height: ICON_SIZE + "px",
                  fill: "gray",
                }}
              />
              Style
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, pages, selection } = state.project;
  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? pages.pageById[activeSlideId] : null;

  let totalAnimationCounter = 0;

  if (selection.selectionForProperties?.type === "layer" && layer) {
    // totalAnimationCounter =
    //   (layer?.transitions?.in?.length || 0) +
    //   (layer?.transitions?.out?.length || 0) +
    //   (layer?.transitions?.layer?.length || 0);
  }

  if (selection.selectionForProperties?.type === "slide" && slide) {
    // totalAnimationCounter = slide?.transitions?.slide?.length || 0;
  }

  if (selection.selectionForProperties?.type === "object" && object) {
    // totalAnimationCounter =
    //   (object?.transitions?.in?.length || 0) +
    //   (object?.transitions?.out?.length || 0) +
    //   (object?.transitions?.animation?.length || 0) +
    //   (object?.transitions?.event?.length || 0);
  }

  return {
    elementType: selection.selectionForProperties?.type,
    totalAnimationCounter,
    selectionForProperties: selection.selectionForProperties,
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PropertiesSectionsPanel);
