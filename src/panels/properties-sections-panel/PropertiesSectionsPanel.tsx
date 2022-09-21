import { Button, Icon, Portal, Tag, Text } from "@blueprintjs/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import { ReactComponent as IdIcon } from "./icons/id.svg";
import { ReactComponent as PropertiesIcon } from "./icons/properties.svg";

import { ReactComponent as AnimationIcon } from "./icons/animation.svg";
import { ReactComponent as LinkIcon } from "./icons/link.svg";
import { ReactComponent as LayoutIcon } from "./icons/layout.svg";
import { ReactComponent as TransformIcon } from "./icons/transform.svg";
import { ReactComponent as CommonStyleIcon } from "./icons/common-style.svg";

import { ReactComponent as ZoomToolIcon } from "../../assets/icons/zoom-tool.svg";
import { ReactComponent as HistoryToolIcon } from "../../assets/icons/history-tool.svg";
import { ReactComponent as AddTextboxIcon } from "../../assets/icons/add-textbox2.svg";

import AddPanel from "../add-panel/AddPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import SettingsPanel from "../settings-panel/SettingsPanel";

import css from "./PropertiesSectionsPanel.module.scss";
import {
  decreaseStageZoom,
  increaseStageZoom,
  doUndo,
  doRedo,
  setStageTool,
  setZoomFit,
} from "../../store/actions/actions";
import HistoryPanel from "../history-panel/HistoryPanel";
import { StageTools } from "../../store/reducers/stage";
import FontPreviewPanel from "../font-preview-panel/FontPreviewPanel";
import MediaLibraryPanel from "../media-library/MediaLibraryPanel";
import ProjectsLibraryPanel from "../projects-library-panel/ProjectsLibraryPanel";
import { getZoom } from "../../store/helpers/calculateZoom";
import { IntegrationContext } from "../../integration";
import {
  PropertiesPanelContext,
  PropertiesPanelSection,
} from "../properties-panel-all/PropertiesPanelProvider";

const ICON_SIZE = 28;

type IPropertiesSectionsPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const PropertiesSectionsPanel: React.FC<IPropertiesSectionsPanel> = (props) => {
  const { totalEffectCounter } = props;

  const { activeSection, setActiveSection } = useContext(
    PropertiesPanelContext
  );

  return (
    <div className={css.propertiesSections}>
      <div className={css.buttonGroupsHolder}>
        <div>
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
        </div>
        <div>
          <Button
            minimal
            active={activeSection === PropertiesPanelSection.Properties}
            onClick={() => {
              setActiveSection(PropertiesPanelSection.Properties);
            }}
          >
            <PropertiesIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
            <div>Properties</div>
          </Button>
        </div>

        <div>
          <Button
            minimal
            active={activeSection === PropertiesPanelSection.Transform}
            onClick={() => {
              setActiveSection(PropertiesPanelSection.Transform);
            }}
          >
            <TransformIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
            <div>Transform</div>
          </Button>
        </div>

        <div>
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
        </div>
        <div>
          <Button
            minimal
            active={activeSection === PropertiesPanelSection.Linking}
            onClick={() => {
              setActiveSection(PropertiesPanelSection.Linking);
            }}
          >
            <LinkIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
            Linking
          </Button>
        </div>
        <div>
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
            <div>Animations</div>
            {totalEffectCounter > 0 && (
              <Tag round intent="none" minimal className={css.tag}>
                {totalEffectCounter}
              </Tag>
            )}
          </Button>
        </div>
        <div>
          <Button
            minimal
            active={activeSection === PropertiesPanelSection.CommonStyle}
            onClick={() => {
              setActiveSection(PropertiesPanelSection.CommonStyle);
            }}
          >
            <CommonStyleIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
            Style
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, layers, slides, selection } = state.project;
  const { activeObjectId, activeLayerId, activeSlideId } = selection;

  const object = activeObjectId ? objects.objectById[activeObjectId] : null;
  const layer = activeLayerId ? layers.layerById[activeLayerId] : null;
  const slide = activeSlideId ? slides.slideById[activeSlideId] : null;

  let totalEffectCounter = 0;

  if (selection.selectionForProperties?.type === "layer" && layer) {
    totalEffectCounter =
      (layer?.transitions?.in?.length || 0) +
      (layer?.transitions?.out?.length || 0) +
      (layer?.transitions?.layer?.length || 0);
  }

  if (selection.selectionForProperties?.type === "slide" && slide) {
    totalEffectCounter = slide?.transitions?.slide?.length || 0;
  }

  if (selection.selectionForProperties?.type === "object" && object) {
    totalEffectCounter =
      (object?.transitions?.in?.length || 0) +
      (object?.transitions?.out?.length || 0) +
      (object?.transitions?.effect?.length || 0) +
      (object?.transitions?.event?.length || 0);
  }

  return {
    totalEffectCounter,
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PropertiesSectionsPanel);
