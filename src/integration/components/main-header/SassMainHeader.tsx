import React, { useEffect, useState } from "react";
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
import { ReactComponent as DaapLogo } from "./daap-logo.svg";
import { IStore } from "../../../store/store";
import { ITheme } from "../../../store/reducers/i-settings";
import { setTheme, updateProjectMeta } from "../../../store/actions/actions";
import { connect } from "react-redux";
import { IMeta } from "../../../store/reducers/meta";
import EditableText from "../../../utils/components/editable-text/editable-text";
import Login from "../../../pages/login/Login";
import { AUTH_LOGOUT } from "../../../pages/login/constants";
import css from "./SassMainHeader.module.scss";
import { ReactComponent as LibraryIcon } from "../../../panels/toolbar-panel/assets/library-icon.svg";
import { ReactComponent as AddObjectIcon } from "../../../panels/toolbar-panel/assets/add-object-icon.svg";
import ChangeCheckerButton from "../../../utils/components/change-checker-button/ChangeCheckerButton";
import { Breakpoint } from "../../../panels/project-settings-panel/breakpoint-component/Breakpoint";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

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
  } = props;

  // const [meData, setMeData] = useState<{
  //   loading?: boolean;
  //   data?: any;
  //   error?: string;
  //   errorMessage?: string;
  // }>({});

  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <div className={cx(css.mainHeader, className)}>
        <div className={css.left}>
          <DaapLogo className={css.logo} />
          <div className={css.leftActionHolder}>
            <div>
              <ButtonGroup minimal={true}>
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
                  Documents
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

                <Divider dir="horizontal" />

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
          {account.userDataLoading ||
          typeof account.userData?.displayName === "undefined" ? (
            <Button
              large
              intent="primary"
              icon="person"
              loading={account.userDataLoading}
              style={{ marginRight: "0px" }}
              onClick={() => {
                setLoginOpen(true);
              }}
            >
              {account.userDataLoading ? "Loading..." : "Log in"}
            </Button>
          ) : (
            <Popover
              position={"bottom-right"}
              className="bp5-light"
              content={
                <Menu className={css.contextMenu}>
                  <MenuDivider title="Account" />
                  <MenuItem
                    text="Settings"
                    icon="cog"
                    // labelElement={
                    //   <Icon icon={theme === "dark" ? "tick" : undefined} />
                    // }
                    onClick={() => {
                      const event = new CustomEvent("OPEN_ACCOUNT_SETTINGS");
                      window.dispatchEvent(event);
                    }}
                  />
                  <MenuDivider title="Theme" />
                  <MenuItem
                    text="Dark"
                    icon="moon"
                    labelElement={
                      <Icon icon={theme === "dark" ? "tick" : undefined} />
                    }
                    onClick={() => {
                      _setTheme("dark");
                    }}
                  />
                  <MenuItem
                    text="Light"
                    icon="flash"
                    labelElement={
                      <Icon icon={theme === "light" ? "tick" : undefined} />
                    }
                    onClick={() => {
                      _setTheme("light");
                    }}
                  />
                  {/* </MenuItem> */}

                  <MenuDivider />

                  <a href={AUTH_LOGOUT}>
                    <MenuItem icon="logout" text="Logout" />
                  </a>
                </Menu>
              }
            >
              <Button
                large
                minimal
                rightIcon="caret-down"
                style={{ marginRight: "0px" }}
                icon={
                  account.userData?.profilePicture ? (
                    <img
                      style={{ borderRadius: "50%" }}
                      width="30"
                      height="30"
                      alt="Profile avatar"
                      src={account.userData?.profilePicture}
                    />
                  ) : (
                    "person"
                  )
                }
              >
                {account.userData?.displayName}
              </Button>
            </Popover>
          )}
          {/* </Link> */}
        </div>
      </div>
      <Dialog
        isCloseButtonShown={true}
        // {...props}
        isOpen={loginOpen}
        onClose={() => {
          setLoginOpen(false);
        }}
      >
        <DialogBody
        // useOverflowScrollContainer={
        //   footerStyle === "minimal" ? false : undefined
        // }
        >
          <GoogleReCaptchaProvider
            reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY!}
          >
            <Login />
          </GoogleReCaptchaProvider>
        </DialogBody>

        {/* {footerStyle === "default" && (
          <DialogFooter actions={footerActions}>All checks passed</DialogFooter>
        )}

        {footerStyle === "minimal" && (
          <DialogFooter minimal={true} actions={footerActions} />
        )} */}
      </Dialog>
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
