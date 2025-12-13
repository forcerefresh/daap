import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import cx from "classnames";
import * as yup from "yup";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { connect } from "react-redux";
import { Button, FormGroup, InputGroup, Text } from "@blueprintjs/core";
import {
  APPLE_AUTH_LINK,
  GEST_AUTH_LINK,
  // FACEBOOK_AUTH_LINK,
  GOOGLE_AUTH_LINK,
} from "./constants";
import css from "./Login.module.scss";
import { IStore } from "../../store/store";
import GoogleIcon from "../assets/google-logo.svg?react";
// import  FacebookIcon } from "../assets/facebook-logo.svg?react";
import EmailIcon from "../assets/email-icon.svg?react";
import AppleIcon from "../assets/apple-logo.svg?react";
import GuestIcon from "../assets/guest-icon.svg?react";
import { useNavigate } from "react-router-dom";
import { getPendingTemplate } from "../search/utils/pending-template";

interface ILoginProps {
  requestClose?: () => void;
}

export type IAlignPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  ILoginProps;

const Login: React.FC<IAlignPanelMergedProps> = (props) => {
  const navigate = useNavigate();

  const { theme, requestClose } = props;
  const [loading, setLoading] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState(false);
  const [showMagicLoginEmailSent, setShowMagicLoginEmailSent] = useState(false);
  const [recaptchaValid, setRecaptchaValid] = useState({
    valid: true,
    message: "",
  });

  const { executeRecaptcha } = useGoogleReCaptcha();

  const submitEmailForMagicLogin = useCallback(async () => {
    const email = (
      document.getElementById("your_email_input") as HTMLInputElement
    ).value;

    try {
      yup.string().required().email().validateSync(email);
      setEmailValidationError(false);
    } catch (ex) {
      setEmailValidationError(true);
      return;
    }

    if (!executeRecaptcha) {
      setRecaptchaValid({ valid: false, message: "" });
      return;
    }

    const token = await executeRecaptcha("login");

    setLoading(true);

    fetch(`/auth/magiclogin`, {
      method: `POST`,
      body: JSON.stringify({
        // `destination` is required.
        recaptchaToken: token,
        destination: email,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setShowMagicLoginEmailSent(true);
          // The request successfully completed and the email to the user with the
          // magic login link was sent!
          // You can now prompt the user to click on the link in their email
          // We recommend you display json.code in the UI (!) so the user can verify
          // that they're clicking on the link for their _current_ login attempt
          //document.body.innerText = json.code;
        } else if (json.error) {
          setRecaptchaValid({ valid: false, message: json.errorMessage });
        }
      })
      .catch((ex) => {
        console.error(ex);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [executeRecaptcha]);

  useLayoutEffect(() => {
    document.body.className = `bp5-${theme}`;
  }, [theme]);

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const template = getPendingTemplate();

    if (template)
      setPreviewUrl(
        `/api/v1/public/public-media/${template.previewUid}.jpeg?language=${template?.language}`
      );
  }, []);

  if (showMagicLoginEmailSent) {
    return (
      <div className={css.login}>
        <div className={css.containerEmailSent}>
          <h1>We have sent you an email!</h1>
          <p>
            An email with a login link has been sent to your email.
            <br />
            Check your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={css.login}>
      <div className={css.container}>
        <h1>Welcome to DAAP</h1>
        {previewUrl && (
          <img
            src={previewUrl}
            loading="lazy"
            style={{
              maxWidth: "100px",
              maxHeight: "100px",
              marginBottom: "10px",
            }}
          />
        )}
        {/* <p>Log in to customize and save your documents.</p> */}
        <p>
          Log in to unlock customization, save your progress, and download your
          final design.
        </p>
        <form className={css.form}>
          {/* <a href={GEST_AUTH_LINK} className={css.buttonAnchor}>
            <Button className={cx(css.whiteButton, css.btn)}>
              <GuestIcon width={30} height={30} />
              <div style={{ textAlign: "left" }}>
                Continue as Guest
                <br />
                <span style={{ fontSize: "13px" }}>
                  No registration required
                </span>
              </div>
            </Button>
          </a> */}
          <a href={GOOGLE_AUTH_LINK} className={css.buttonAnchor}>
            <Button className={cx(css.whiteButton, css.btn)}>
              <GoogleIcon width={30} height={30} />
              Continue with Google
            </Button>
          </a>

          {/* <a href={FACEBOOK_AUTH_LINK} className={css.buttonAnchor}>
            <Button className={cx(css.fb, css.btn)}>
              <FacebookIcon width={30} height={30} /> Continue with Facebook
            </Button>
          </a> */}

          <a href={APPLE_AUTH_LINK} className={css.buttonAnchor}>
            <Button className={cx(css.whiteButton, css.btn)}>
              <AppleIcon width={30} height={30} />
              Continue with Apple
            </Button>
          </a>
          <h2>or</h2>
          <FormGroup labelFor={"your_email_input"}>
            <InputGroup
              onFocus={() => {
                setEmailValidationError(false);
              }}
              large
              id={"your_email_input"}
              placeholder="Enter you email address"
            />
            {emailValidationError && (
              <div className={css.errorMessage}>
                Email is not valid. Please enter valid email.
              </div>
            )}
          </FormGroup>

          {!recaptchaValid.valid && (
            <>
              <div className={css.errorMessage}>
                Recaptch check has failed. Reload page and try to login again.
              </div>
              {recaptchaValid.message && (
                <div className={css.errorMessage}>{recaptchaValid.message}</div>
              )}
            </>
          )}

          <div className={css.buttonAnchor}>
            <Button
              disabled={loading}
              className={cx(css.greenButton, css.btn)}
              onClick={submitEmailForMagicLogin}
            >
              <EmailIcon width={28} height={28} />
              Send Me Login Link
            </Button>
          </div>

          <div className={css.backToTemplatesHolder}>
            <Text>Don't want to login?</Text>
            <Button
              onClick={() => {
                requestClose?.();
                localStorage.removeItem("pendingTemplate");
                navigate("/search");
              }}
            >
              ← Back to templates search
            </Button>

            {/* <Button
              style={{ display: "inline" }}
              onClick={() => {
                navigate("/search");
              }}
            >
              Go to search
            </Button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { settings } = state.project;
  return {
    theme: settings.theme,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
