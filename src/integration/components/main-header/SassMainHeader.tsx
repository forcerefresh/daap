import React, { useEffect, useState } from "react";
import cx from "classnames";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogBody,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Text,
} from "@blueprintjs/core";
import { ReactComponent as DaapLogo } from "./daap-logo.svg";

import css from "./SassMainHeader.module.scss";
import { IStore } from "../../../store/store";
import { ITheme } from "../../../store/reducers/i-settings";
import { setTheme, updateProjectMeta } from "../../../store/actions/actions";
import { connect } from "react-redux";
import { IMeta } from "../../../store/reducers/meta";
import EditableText from "../../../utils/components/editable-text/editable-text";
import { Link } from "react-router-dom";
import Login from "../../../pages/login/Login";
import { AUTH_LOGOUT } from "../../../pages/login/constants";

type IMainHeader = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

const MainHeader = (props: IMainHeader) => {
  const { className, _setTheme, settings, meta, _updateProjectMeta, theme } =
    props;

  const [meData, setMeData] = useState<{
    loading?: boolean;
    data?: any;
    error?: string;
    errorMessage?: string;
  }>({});

  // const [height, setHeight] = useState(100);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    axios
      .get("/api/me")
      .then(function (response) {
        if (response?.data?.error) {
          setMeData({
            data: null,
            ...(response?.data ? response?.data : {}),
            loading: false,
          });
        } else {
          setMeData({
            data: response?.data,
            error: undefined,
            errorMessage: undefined,
            loading: false,
          });
        }

        // handle success
        console.log(response);
      })
      .catch(function (error) {
        setMeData({ loading: false, data: undefined, error: "Error" });
        console.log(error);
      });
  }, []);

  return (
    <>
      <div
        className={cx(css.mainHeader, className)}
        // style={{ height: height + "px" }}
      >
        <div className={css.left}>
          <DaapLogo className={css.logo} />
        </div>
        <div className={css.center}>
          <EditableText
            value={meta.name ?? ""}
            onChange={(value) => {
              _updateProjectMeta({ ...meta, name: value });
            }}
          />
          <Icon icon="cloud-tick" className={css.title} />
        </div>
        <div className={css.right}>
          {/* <div className={css.themeHolder}>
           <Text className={css.themeLabel}>Theme</Text>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon icon="moon" />
            <Switch
              style={{ margin: "0px" }}
              checked={settings.theme === "light"}
              onChange={(evt: SyntheticEvent<HTMLInputElement>) => {
                _setTheme(evt.currentTarget.checked ? "light" : "dark");
              }}
            />
            <Icon icon="flash" />
          </div>
        </div> */}
          <Button
            minimal
            large
            rightIcon="caret-down"
            style={{ marginRight: "20px" }}
          >
            Create
          </Button>
          <Button large icon="download">
            Download
          </Button>
          {/* <Link to={"/login"}> */}
          {meData.loading || !meData.data?.userData?.username ? (
            <Button
              large
              intent="primary"
              icon="person"
              loading={meData.loading}
              onClick={() => {
                setLoginOpen(true);
              }}
            >
              {meData.loading ? "Loading..." : "Sign in"}
            </Button>
          ) : (
            <Popover
              position={"bottom-right"}
              className="bp5-light"
              content={
                <Menu className={css.contextMenu}>
                  <MenuItem text="Theme" icon="contrast">
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
                      labelElement={theme === "light" ? "tick" : undefined}
                      onClick={() => {
                        _setTheme("light");
                      }}
                    />
                  </MenuItem>

                  <MenuDivider />

                  <a href={AUTH_LOGOUT}>
                    <MenuItem icon="logout" text="Logout" />
                  </a>
                </Menu>
              }
            >
              <Button large intent="primary" icon="person">
                {meData.data?.userData?.username}
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
          <Login />
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

const mapStateToProps = (state: IStore) => ({
  settings: state.project.settings,
  meta: state.meta,
  theme: state.project.settings.theme,
});

const mapDispatchToProps = {
  _setTheme: (theme: ITheme) => setTheme(theme),
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
};

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);
