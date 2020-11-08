import React from "react";
import { connect } from "react-redux";
import { Button } from "@blueprintjs/core";
import { ReactComponent as TabletPreviewIcon } from "../../assets/icons/tablet-preview.svg";
import css from "./ActionPanel.module.scss";
import { IStore } from "../../store/store";

export const ActionPanel = () => {
  return (
    <div className={css.actionPanel}>
      <div className={css.previewButtons}>
        <Button intent="success" large icon="desktop" />
        <Button intent="success" large>
          <TabletPreviewIcon
            style={{ width: "16px", height: "16px", fill: "white" }}
          />
        </Button>
        <Button intent="success" large icon="mobile-phone" />
      </div>
      <Button intent="primary" large style={{ width: "100%" }}>
        SAVE
      </Button>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);
