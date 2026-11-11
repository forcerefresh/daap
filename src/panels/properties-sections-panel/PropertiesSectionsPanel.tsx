import { Button } from "@blueprintjs/core";
import React, { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import PropertiesIcon from "./icons/properties.svg?react";

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
  const { selectionForProperties } = props;

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
  const { selection } = state.project;

  return {
    selectionForProperties: selection.selectionForProperties,
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PropertiesSectionsPanel);
