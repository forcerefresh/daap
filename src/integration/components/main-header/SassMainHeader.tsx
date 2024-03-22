import React, { useEffect, useState } from "react";
import cx from "classnames";
import axios from "axios";
import { Button, Icon, Text } from "@blueprintjs/core";
import { ReactComponent as DaapLogo } from "./daap-logo.svg";

import css from "./SassMainHeader.module.scss";
import { IStore } from "../../../store/store";
import { ITheme } from "../../../store/reducers/i-settings";
import { setTheme, updateProjectMeta } from "../../../store/actions/actions";
import { connect } from "react-redux";
import { IMeta } from "../../../store/reducers/meta";
import EditableText from "../../../utils/components/editable-text/editable-text";
import { Link } from "react-router-dom";

type IMainHeader = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    className?: string;
  };

const MainHeader = (props: IMainHeader) => {
  const { className, _setTheme, settings, meta, _updateProjectMeta } = props;

  const [meData, setMeData] = useState<{
    loading?: boolean;
    data?: any;
    error?: string;
  }>({});

  useEffect(() => {
    axios
      .get("/api/me")
      .then(function (response) {
        setMeData({ ...meData, data: response, error: undefined });
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        setMeData({ loading: false, data: undefined, error: "Error" });
        console.log(error);
      });
  }, []);

  return (
    <div className={cx(css.mainHeader, className)}>
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
        <Link to={"/login"}>
          <Button large intent="primary" icon="person" loading={meData.loading}>
            {meData.loading
              ? "Loading..."
              : meData.data?.data
              ? meData.data.data?.userData?.username
              : "Sign in"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  settings: state.project.settings,
  meta: state.meta,
});

const mapDispatchToProps = {
  _setTheme: (theme: ITheme) => setTheme(theme),
  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
};

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);
