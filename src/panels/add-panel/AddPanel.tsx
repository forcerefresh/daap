import { Button, Card, Elevation } from "@blueprintjs/core";
import React from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./AddPanel.module.scss";
import { addNewObject } from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { getAppObjectDefinitionsByGroup } from "webslider-sdk/lib/objects/objects-register";
import SVG from "react-inlinesvg";
import { getObjectSizeFromMeta } from "./add-object-utils";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

interface IAddPanelProps {
  onRequestClose: () => void;
  onRequestFontPreview: () => void;
}

export type IAddPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IAddPanelProps;

const AddPanel: React.FC<IAddPanelMergedProps> = (props) => {
  const {
    _addNewObject,
    activeLayerId,
    onRequestClose,
    breakpointConfig,
    themeClass,
  } = props;

  const hasLicense = true;

  const isObjectDisabledForFree = (type: string) => {
    if (hasLicense) return false;

    return (
      type === "multi-image-object" ||
      type === "html-object" ||
      type === "rich-text-object"
    );
  };

  const hideObjects = [
    "io.forcerefresh.image.object",
    "io.forcerefresh.vector.object",
    "io.forcerefresh.free-draw.object",
    "io.forcerefresh.text.object",
  ];

  const renderObjectsCards = (group: string) => {
    const objDeffsAll = getAppObjectDefinitionsByGroup(group);

    const objDeffs = objDeffsAll.filter(
      (objDeff) => hideObjects.indexOf(objDeff.type) === -1,
    );

    return (
      <>
        {objDeffs.map((deff) => (
          <Card
            key={"object_card_" + deff.type}
            style={{
              opacity: !activeLayerId ? "0.5" : "1",
            }} // || disabled
            interactive={!!activeLayerId}
            elevation={Elevation.ONE}
            className={cx(css.card, {
              [css.disabled]: !activeLayerId, //|| disabled,
            })}
            onClick={() => {
              if (isObjectDisabledForFree(deff.type)) return;
              if (activeLayerId) {
                _addNewObject(activeLayerId, deff.type, {
                  ...getObjectSizeFromMeta(deff.meta, breakpointConfig),
                });
                onRequestClose();
              }
            }}
          >
            <div className={css.svgHolder}>
              <SVG src={deff?.meta?.icon || ""} />
            </div>

            <h3>{deff.meta.name}</h3>
            <p className={css.description}>{deff.meta.description}</p>
            {deff.external && <div className={css.external}>EXT</div>}
            {deff.development && <div className={css.development}>DEV</div>}
            {isObjectDisabledForFree(deff.type) && (
              <div className={css.licenseRequired}>LICENSE REQUIRED</div>
            )}
          </Card>
        ))}
      </>
    );
  };

  return (
    <div className={cx(themeClass, css.addPanel)}>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <Button icon="cross" minimal onClick={onRequestClose} />
      </div>
      {!activeLayerId && (
        <div className={css.info}>
          No active layer found. Please select layer before adding objects.
        </div>
      )}
      <section>
        <div>
          <h1>Media</h1>
          <p>Image, Video, Svg and other objects that use media resources</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {renderObjectsCards("media")}
        </div>
      </section>

      <section>
        <div>
          <h1>Other</h1>
          <p>Various objects</p>
        </div>

        <div>{renderObjectsCards("other")}</div>
      </section>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const breakpointConfig: BreakpointConfiguration | undefined =
    state.project.settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice,
    );

  return {
    activeLayerId: state.project.selection.activeLayerId,
    themeClass: state.project.settings.themeClass,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
  ) => addNewObject(layerId, type, objectProps),
};

export default connect(mapStateToProps, mapDispatchToProps)(AddPanel);
