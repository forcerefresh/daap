import {
  Button,
  Dialog,
  DialogBody,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
} from "@blueprintjs/core";
import { ITheme } from "../../../store/reducers/i-settings";
import { setTheme, updateProjectMeta } from "../../../store/actions/actions";
import { IMeta } from "../../../store/reducers/meta";
import { connect } from "react-redux";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { IStore } from "../../../store/store";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Login from "../../../pages/login/Login";
import { AUTH_LOGOUT } from "../../../pages/login/constants";
import css from "./SassMainHeader.module.scss";
import { useEffect, useMemo, useRef, useState } from "react";

type IAccountButtonProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
    buttonStyle?: any;
    autoShowPrompt?: boolean;
    logoutOnly?: boolean;
  };

export function AccountButton(props: IAccountButtonProps) {
  const { account, theme, _setTheme, buttonStyle, autoShowPrompt, logoutOnly } =
    props;

  const [loginOpen, setLoginOpen] = useState(false);

  const dialog = useMemo(() => {
    return (
      <Dialog
        canOutsideClickClose={false}
        isCloseButtonShown={false}
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
            reCaptchaKey={import.meta.env.VITE_APP_RECAPTCHA_SITE_KEY!}
          >
            <Login
              requestClose={() => {
                setLoginOpen(false);
              }}
            />
          </GoogleReCaptchaProvider>
        </DialogBody>

        {/* {footerStyle === "default" && (
              <DialogFooter actions={footerActions}>All checks passed</DialogFooter>
            )}
    
            {footerStyle === "minimal" && (
              <DialogFooter minimal={true} actions={footerActions} />
            )} */}
      </Dialog>
    );
  }, [setLoginOpen, loginOpen]);

  const loginRef = useRef<any>(null);

  // >>>>>
  const accountRef = useRef<{
    userDataLoading?: boolean;
    displayName?: string;
  }>();
  accountRef.current = {
    userDataLoading: account.userDataLoading,
    displayName: account.userData?.displayName,
  };

  useEffect(() => {
    if (autoShowPrompt) {
      setTimeout(() => {
        if (!account?.userDataLoading) {
          if (!account?.userData?.displayName) {
            loginRef.current?.click?.();
          } else {
            // const template = localStorage.get("pendingTemplate");
            // TODO: load and apply
          }
        }
      }, 200);
    }
  }, [account, autoShowPrompt]);

  if (
    account.userDataLoading ||
    typeof account.userData?.displayName === "undefined"
  ) {
    return (
      <>
        <Button
          intent="primary"
          icon="person"
          loading={account.userDataLoading}
          style={{ marginRight: "0px", ...buttonStyle }}
          ref={loginRef}
          onClick={() => {
            setLoginOpen(true);
          }}
        >
          {account.userDataLoading ? "Loading..." : "Log in"}
        </Button>
        {dialog}
      </>
    );
  }

  return (
    <>
      <Popover
        position={"bottom-right"}
        className="bp5-light"
        content={
          <Menu className={css.contextMenu}>
            <MenuDivider title="Account" />
            {!logoutOnly && (
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
            )}

            {/* <MenuDivider title="Theme" />
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
            /> */}
            {/* </MenuItem> */}

            <MenuDivider />

            <a href={AUTH_LOGOUT}>
              <MenuItem icon="log-out" text="Logout" />
            </a>
          </Menu>
        }
      >
        <Button
          minimal
          rightIcon="caret-down"
          style={{ marginRight: "0px", ...buttonStyle }}
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
      {dialog}
    </>
  );
}

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

export default connect(mapStateToProps, mapDispatchToProps)(AccountButton);
