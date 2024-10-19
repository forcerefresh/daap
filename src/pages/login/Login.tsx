import React, { useLayoutEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import cx from "classnames";

import { useFormik } from "formik";

import { compose } from "redux";
import { connect } from "react-redux";
import _ from "lodash";

// import { loginUserWithEmail } from "../../store/actions/authActions";
import { FACEBOOK_AUTH_LINK, GOOGLE_AUTH_LINK } from "./constants";
import { loginSchema } from "./validation";
import css from "./Login.module.scss";
import { IStore } from "../../store/store";
import { ReactComponent as GoogleIcon } from "../assets/google-logo.svg";
import { ReactComponent as FacebookIcon } from "../assets/facebook-logo.svg";
import { ReactComponent as EmailIcon } from "../assets/email-icon.svg";

import { Button, FormGroup, Icon, InputGroup } from "@blueprintjs/core";

interface ILoginProps {}

export type IAlignPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ILoginProps;

const Login: React.FC<IAlignPanelMergedProps> = (props) => {
  const { theme } = props;

  useLayoutEffect(() => {
    document.body.className = `bp5-${theme}`;
  }, [theme]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      // loginUserWithEmail(values, history);
    },
  });

  //if (auth.isAuthenticated) return <Redirect to="/" />;

  return (
    <div className={css.login}>
      <div className={css.container}>
        <h1>Log in</h1>
        <p>Log in and start creating!</p>
        <form onSubmit={formik.handleSubmit} className={css.form}>
          {/* <a className={cx(css.google, css.btn)} href={GOOGLE_AUTH_LINK}>
            <GoogleIcon width={30} height={30} /> Continue with Google
          </a> */}
          <a href={GOOGLE_AUTH_LINK} className={css.buttonAnchor}>
            <Button className={cx(css.google, css.btn)}>
              <GoogleIcon width={30} height={30} /> Continue with Google
            </Button>
          </a>

          <a href={FACEBOOK_AUTH_LINK} className={css.buttonAnchor}>
            <Button className={cx(css.fb, css.btn)}>
              <FacebookIcon width={30} height={30} /> Continue with Facebook
            </Button>
          </a>
          <h2>or</h2>
          <FormGroup
            // label={"YOU EMAIL"}
            labelFor={"you_email_input"}
            // inline
            // helperText={underFieldText}
          >
            <InputGroup
              large
              id={"you_email_input"}
              placeholder="Enter you email address"
              // value={value}
              // intent={!!externalError ? Intent.WARNING : Intent.NONE}
              // onChange={(event: any) => onChange(event.target.value)}
              // onInput={(event: any) => onInput(event.target.value)}
              // {...inputProps}
            />
          </FormGroup>

          <div className={css.buttonAnchor}>
            <Button className={cx(css.email, css.btn)}>
              <EmailIcon width={28} height={28} /> Send Me Login Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// const mapStateToProps = (state) => ({
//   auth: state.auth,
//   errors: state.errors,
// });

// export default compose(
//   withRouter,
//   connect(mapStateToProps, { loginUserWithEmail })
// )(Login);

const mapStateToProps = (state: IStore) => {
  const { settings } = state.project;
  return {
    theme: settings.theme,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
