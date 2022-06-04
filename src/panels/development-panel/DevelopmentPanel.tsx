import React, { useContext, useEffect, useRef, useState } from "react";
import cx from "classnames";
import InfiniteScroll from "react-infinite-scroll-component";
import { debounce } from "lodash-es";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Alert, Button, InputGroup, Intent, Spinner } from "@blueprintjs/core";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import css from "./DevelopmentPanel.module.scss";
import { loadAndRegisterExternalComponent } from "../../objects/external-object-utils";
import { IMarketItem } from "../../webslider-sdk/src/objects/i-marketplace";

interface IDevelopmentPanelProps {
  onRequestClose: () => void;
}

export type IDevelopmentMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IDevelopmentPanelProps;

const DevelopmentPanel: React.FC<IDevelopmentMergedProps> = (props) => {
  return (
    <div className={css.marketplacePanel}>
      <div className={css.headerSection}>
        <div>HEADER</div>
      </div>

      <div>sadsad</div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DevelopmentPanel);
