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
    slides,
    layers,
    action,
    animations,
    // layoutType,
    quickBar,
    layersSimplified,
    floatingActions,
    floatingPointer,
    showSimplifiedLayerPanel,
    pagesSimplified,
    showSimplifiedPagesPanel,
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
        {/* <div>
          <div className={css.action}>{action}</div>
          <div className={css.slides}>{slides}</div>
          <div className={css.layers}>{layers}</div>
        </div> */}
      </div>
    </div>
  );

  // switch (layoutType) {
  //   case "default-layers": {
  //     return (
  //       <div className={cx(css.mainLayout, css.defaultLayersStyle)}>
  //         <div className={css.left}>{toolbar}</div>
  //         <div className={cx(css.center, "layout-center-area")}>
  //           <div className={css.quickBar}>{quickBar}</div>
  //           <div className={cx(css.content, "layout-content-area")}>
  //             {content}
  //             {floatingActions}
  //             {floatingPointer}
  //             <div className={css.simplifiedFloatingPanelHolder}>
  //               {showSimplifiedLayerPanel && (
  //                 <div
  //                   className={cx(
  //                     css.layersSimplified,
  //                     "layers-simplified-panel"
  //                   )}
  //                 >
  //                   {layersSimplified}
  //                 </div>
  //               )}
  //               {showSimplifiedPagesPanel && (
  //                 <div
  //                   className={cx(
  //                     css.pagesSimplified,
  //                     "pages-simplified-panel"
  //                   )}
  //                 >
  //                   {pagesSimplified}
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //         <div className={css.right}>
  //           <div>
  //             <div className={css.properties}>{properties}</div>
  //           </div>
  //           {/* <div>
  //             <div className={css.action}>{action}</div>
  //             <div className={css.slides}>{slides}</div>
  //             <div className={css.layers}>{layers}</div>
  //           </div> */}
  //         </div>
  //       </div>
  //     );
  //   }
  //   // "case: "default"
  //   default: {
  //     return (
  //       <div className={cx(css.mainLayout, css.defaultStyle)}>
  //         <div className={css.left}>{toolbar}</div>
  //         <div className={cx(css.center, "layout-center-area")}>
  //           <div className={css.quickBar}>{quickBar}</div>
  //           <div className={cx(css.content, "layout-content-area")}>
  //             {content}
  //             {floatingActions}
  //             {floatingPointer}
  //             <div className={css.simplifiedFloatingPanelHolder}>
  //               {showSimplifiedLayerPanel && (
  //                 <div
  //                   className={cx(
  //                     css.layersSimplified,
  //                     "layers-simplified-panel"
  //                   )}
  //                 >
  //                   {layersSimplified}
  //                 </div>
  //               )}
  //               {showSimplifiedPagesPanel && (
  //                 <div
  //                   className={cx(
  //                     css.pagesSimplified,
  //                     "pages-simplified-panel"
  //                   )}
  //                 >
  //                   {pagesSimplified}
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //         <div className={css.right}>
  //           {/* <div className={css.action}>{action}</div>
  //           <div className={css.slides}>{slides}</div>
  //           <div className={css.layers}>{layers}</div> */}
  //           <div className={css.properties}>{properties}</div>
  //         </div>
  //       </div>
  //     );
  //   }
  // }
}

const mapStateToProps = (state: IStore) => ({
  // layoutType: state.globals.layoutType,
  showSimplifiedLayerPanel: state.stage.showSimplifiedLayerPanel,
  showSimplifiedPagesPanel: state.stage.showSimplifiedPagesPanel,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout);
