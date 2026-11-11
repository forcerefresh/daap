import React from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import cx from "classnames";

import css from "./MainLayout.module.scss";

export interface IMainLayout {
  toolbar?: React.ReactElement;
  content?: React.ReactElement;
  slides?: React.ReactElement;
  layers?: React.ReactElement;
  properties?: React.ReactElement;
  animations?: React.ReactElement;
  action?: React.ReactElement;
  quickBar?: React.ReactElement;
  layersSimplified?: React.ReactElement;
  pagesSimplified?: React.ReactElement;
  floatingActions?: React.ReactElement;
  floatingPointer?: React.ReactElement;
}

export type IMainLayoutMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IMainLayout;

function MainLayout(props: IMainLayoutMergedProps) {
  const {
    toolbar,
    content,
    properties,
    quickBar,
    layersSimplified,
    floatingActions,
    floatingPointer,
    showSimplifiedLayerPanel,
    pagesSimplified,
    showSimplifiedPagesPanel,
    snapHint,
  } = props;

  return (
    <div className={cx(css.mainLayout, css.defaultLayersStyle)}>
      <div className={css.left}>{toolbar}</div>
      <div className={cx(css.center, "layout-center-area")}>
        <div className={css.quickBar}>{quickBar}</div>
        <div className={cx(css.content, "layout-content-area")}>
          {content}
          {floatingActions}
          {floatingPointer}
          {snapHint && (
            <div className={css.snapHint}>{snapHint}</div>
          )}
          <div className={css.simplifiedFloatingPanelHolder}>
            {showSimplifiedLayerPanel && (
              <div
                className={cx(css.layersSimplified, "layers-simplified-panel")}
              >
                {layersSimplified}
              </div>
            )}
            {showSimplifiedPagesPanel && (
              <div
                className={cx(css.pagesSimplified, "pages-simplified-panel")}
              >
                {pagesSimplified}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={css.right}>
        <div>
          <div className={css.properties}>{properties}</div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: IStore) => ({
  showSimplifiedLayerPanel: state.stage.showSimplifiedLayerPanel,
  showSimplifiedPagesPanel: state.stage.showSimplifiedPagesPanel,
  snapHint: state.stage.snapHint,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout);
