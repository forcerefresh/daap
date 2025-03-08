import React, { useContext, useEffect, useState } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import cx from "classnames";
import axios from "axios";
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogBody,
  Divider,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Portal,
  Tag,
} from "@blueprintjs/core";
import DaapLogo from "./daap-logo.svg?react";
import { IStore } from "../../../store/store";
import { ITheme } from "../../../store/reducers/i-settings";
import { setTheme, updateProjectMeta } from "../../../store/actions/actions";
import { connect } from "react-redux";
import { IMeta } from "../../../store/reducers/meta";
import EditableText from "../../../utils/components/editable-text/editable-text";
import Login from "../../../pages/login/Login";
import { AUTH_LOGOUT } from "../../../pages/login/constants";
import css from "./SassMainHeader.module.scss";
import LibraryIcon from "../../../panels/toolbar-panel/assets/library-icon.svg?react";
import AddObjectIcon from "../../../panels/toolbar-panel/assets/add-object-icon.svg?react";
import ChangeCheckerButton from "../../../utils/components/change-checker-button/ChangeCheckerButton";
import { Breakpoint } from "../../../panels/project-settings-panel/breakpoint-component/Breakpoint";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IntegrationContext } from "../../../integration";
import AccountButton from "./AccountButton";
// import { settings } from "../../../store/reducers/settings";

type IMainHeader = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

const MainHeader = (props: IMainHeader) => {
  const {
    className,
    _setTheme,
    meta,
    _updateProjectMeta,
    breakpointConfig,
    theme,
    account,
    appZoom,
  } = props;

  const {
    getFullscreenButtonComponent: FullscreenButtonComponent,
    useSettingsHook,
  } = useContext(IntegrationContext);

  const { scaleUI } = useSettingsHook();

  // const [meData, setMeData] = useState<{
  //   loading?: boolean;
  //   data?: any;
  //   error?: string;
  //   errorMessage?: string;
  // }>({});

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof account.userData?.displayName !== "undefined") {
      const intervalHandle = setInterval(() => {
        //TODO: replace with keepalive/ping
        axios.get("/api/v1/me").then(() => {});
      }, 1 * 60 * 1000);
      return () => {
        clearInterval(intervalHandle);
      };
    }
  }, [account]);

  return (
    <>
      <div className={cx(css.mainHeader, className)}>
        <div className={css.left}>
          <DaapLogo className={css.logo} />
          <div className={css.leftActionHolder}>
            <div>
              <ButtonGroup minimal={true} className={css.mainButtons}>
                <Button
                  minimal
                  large
                  // rightIcon="caret-down"
                  // style={{ marginRight: "20px" }}
                  icon={<Icon icon="floppy-disk" size={25} />}
                  onClick={() => {
                    const event = new CustomEvent("OPEN_SAVE");
                    window.dispatchEvent(event);
                  }}
                >
                  Save
                </Button>

                {/* <Divider dir="horizontal" /> */}

                <ButtonGroup minimal={true}>
                  {/* <Divider /> */}
                  <Button
                    large
                    minimal
                    // className={css.downloadBtn}
                    icon={<Icon icon="export" size={25} />}
                    onClick={() => {
                      const event = new CustomEvent("OPEN_EXPORT");
                      window.dispatchEvent(event);
                    }}
                  >
                    Export
                  </Button>
                </ButtonGroup>

                <Divider dir="horizontal" />

                <Button
                  minimal
                  large
                  className={css.largeButton}
                  icon={<LibraryIcon width={25} height={25} />}
                  //active={showPanel === VisiblePanel.ProjectsLibrary}
                  onClick={() => {
                    const event = new CustomEvent("OPEN_PROJECTS");
                    window.dispatchEvent(event);
                  }}
                >
                  {/* {missingExtensions?.length > 0 && (
                  <Tag intent={"danger"} round className={css.buttonTag}>
                    {missingExtensions.length}
                  </Tag>
                )} */}
                  Files
                </Button>

                <Divider dir="horizontal" />

                <Button
                  minimal
                  large
                  // rightIcon="caret-down"
                  // style={{ marginRight: "20px" }}
                  icon={<AddObjectIcon width={25} height={25} />}
                  onClick={() => {
                    const event = new CustomEvent("OPEN_CREATE_NEW");
                    window.dispatchEvent(event);
                  }}
                >
                  Create
                </Button>

                <Divider dir="horizontal" />

                <Button
                  minimal
                  large
                  className={css.largeButton}
                  icon={<Icon icon="applications" size={25} />}
                  //active={showPanel === VisiblePanel.ProjectsLibrary}
                  onClick={() => {
                    const event = new CustomEvent("OPEN_TEMPLATES");
                    window.dispatchEvent(event);
                  }}
                >
                  {/* {missingExtensions?.length > 0 && (
                  <Tag intent={"danger"} round className={css.buttonTag}>
                    {missingExtensions.length}
                  </Tag>
                )} */}
                  Templates
                </Button>

                {/* <Divider dir="horizontal" /> */}

                <Portal>
                  <></>
                  {/* {showPanel === VisiblePanel.ProjectsLibrary && (
                  <div ref={sharedRef}>
                    <ProjectsLibraryPanel
                      onRequestClose={() => setShowPanel(VisiblePanel.None)}
                    />
                  </div>
                )} */}
                </Portal>
              </ButtonGroup>
            </div>
          </div>
        </div>
        <div className={css.center}>
          {/* <EditableText
            value={meta.name ?? ""}
            onChange={(value) => {
              _updateProjectMeta({ ...meta, name: value });
            }}
          />
          <Icon icon="cloud-tick" className={css.title} /> */}
        </div>
        <div className={css.projectNameHolder}>
          {meta.name}
          <span
            style={{
              fontFamily: "monospace",
              marginLeft: "10px",
            }}
          >
            {breakpointConfig?.normal.page.width}x
            {breakpointConfig?.normal.page.height}
          </span>
          {/* <EditableText
            value={meta.name ?? ""}
            onChange={(value) => {
              _updateProjectMeta({ ...meta, name: value });
            }}
          /> */}
          {/* <Icon icon="cloud-tick" className={css.inlineIcon} /> */}
          {/* cloud-upload / cloud */}
        </div>

        <div className={css.right}>
          <FullscreenButtonComponent
            toggle={() => {
              setIsFullscreen(!isFullscreen);
              scaleUI(appZoom);
            }}
            isFullscreen={isFullscreen}
            className={css.fullscreenButton}
          />
          {/* <div className={css.rightActionsHolder}>
            <ButtonGroup minimal={true}>
              <Button
                large
                minimal
                icon={"download"}
              >
                Download
              </Button>
            </ButtonGroup>
          </div> */}

          {import.meta.env.VITE_APP_INTEGRATION === "saas" && <AccountButton />}

          {/* </Link> */}
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const breakpointConfig: BreakpointConfiguration | undefined =
    state.project.settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  return {
    settings: state.project.settings,
    appZoom: state.globals.appZoom,
    meta: state.meta,
    theme: state.project.settings.theme,
    account: state.account,
    breakpointConfig,
  };
};

const mapDispatchToProps = {
  _setTheme: (theme: ITheme) => setTheme(theme),
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
};

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);
