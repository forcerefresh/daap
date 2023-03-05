import React, { useState, useContext, useEffect } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./LicenseSettingsPanel.module.scss";
import {
  Button,
  FormGroup,
  HTMLSelect,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";
import {
  updateGlobalConfiguration,
  updateSlideDuration,
} from "../../store/actions/actions";
import { getCheckboxField, getTextField } from "../../inputs/input-utils";

import { IAppSettings } from "../../store/reducers/globals";
import { IntegrationContext } from "../../integration";
import {
  getLicenseNameByType,
  getSubscriptionNameByType,
} from "./license-utils";
import ConfirmButton from "../../utils/components/confirm-button/confirm-button";

enum GlobalPanelSections {
  LicenseConfiguration = "licenseConfiguration",
}

export type ILicenseSettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const LicenseSettingsPanel: React.FC<ILicenseSettingsPanelMergedProps> = (
  props
) => {
  //const { globals, _updateGlobalConfiguration } = props;

  const globalContext = useContext(IntegrationContext);
  const { saveSerial, getLicenseDetails } = globalContext.useLicenseHook();

  const [visibleSectionIds, _setVisibleSectionIds] = useState<{
    [key: string]: boolean;
  }>({
    [GlobalPanelSections.LicenseConfiguration]: true,
  });

  /*
  const toggleSection = (section: string) => {
    setVisibleSectionIds({
      ...visibleSectionIds,
      [section]: !visibleSectionIds[section],
    });
  };*/

  const [currentSerial, setCurrentSerial] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [licenseDetails, setLicenseDetails] = useState<any>({});

  useEffect(() => {
    getLicenseDetails().then((data) => {
      setLicenseDetails(data);
      setCurrentSerial(data.serial || "");
    });
  }, []);

  const saveLicenseKey = async (allowTransfer = false) => {
    setLoading(true);
    await saveSerial({ serial: currentSerial, allowTransfer });
    const licenceDetails = await getLicenseDetails();
    setLicenseDetails(licenceDetails);
    setLoading(false);
  };

  return (
    <div className={css.licenseSettingsPanel}>
      <section>
        <div
          className={css.sectionHeader}
          onClick={() => {
            //toggleSection(GlobalPanelSections.LicenseConfiguration)
          }}
        >
          {/*<Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.LicenseConfiguration]
                ? "caret-down"
                : "caret-right"
            }
        ></Button>*/}
          License settings
        </div>
        {visibleSectionIds[GlobalPanelSections.LicenseConfiguration] && (
          <div className={css.panel}>
            <div className={css.serialGroup}>
              {getTextField(
                "License Key or Item Purchase Code",
                currentSerial,
                (serial) => {
                  setCurrentSerial(serial);
                }
              )}
            </div>
            <div>
              <Button
                loading={loading}
                intent={licenseDetails.status === "OK" ? "none" : "primary"}
                onClick={async () => {
                  saveLicenseKey();
                }}
              >
                {licenseDetails.status === "OK"
                  ? "Update"
                  : "Save and Activate"}
              </Button>
            </div>
            <div className={css.licenseDetails}>
              <strong>License details</strong>

              {licenseDetails?.status && (
                <>
                  <div>
                    Status:{" "}
                    {licenseDetails.status === "OK" && (
                      <span className={css.licenseStatusOk}>
                        Your license is active.
                      </span>
                    )}
                    {licenseDetails.status === "EXPIRED" && (
                      <span className={css.licenseStatusError}>
                        Your subscription license is expired. Please goto
                        webslider.io to renew it.
                      </span>
                    )}
                    {licenseDetails.status === "LICENSE_USED" && (
                      <span className={css.licenseStatusError}>
                        LICENSE IS IN USE. License is for one developer/machine.
                        It cannot be used for more that one installation.
                      </span>
                    )}
                    {licenseDetails.status === "DOES_NOT_EXIST" && (
                      <>
                        <span className={css.licenseStatusError}>
                          Serial Number is not found or it's not valid. Please
                          enter a Serial Number and Activate.
                        </span>
                        <br />
                        {/* <span>
                        <strong>Note:</strong> Application is partially disabled
                        without Serial Number.
                      </span> */}
                        <div>
                          Note:{" "}
                          <span className={css.licenseStatusError}>
                            To enable all features, restart the app after
                            activation.
                            <br />
                            {/* <span>
                    <strong>Note:</strong> Application is partially disabled
                    without Serial Number.
                  </span> */}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {licenseDetails?.status === "LICENSE_USED" && (
                    <div>
                      <strong>
                        To fix license issue follow one of the suggested options
                      </strong>
                      <div style={{ padding: "15px" }}>
                        1. Transfer your license to this installation.
                        <br />
                        <strong>NOTE:</strong> After you transfer license to
                        this machine, license will not be active anymore on
                        other machines. <br />
                        <ConfirmButton
                          intent="primary"
                          onClose={() => {}}
                          onConfirm={() => {
                            saveLicenseKey(true);
                          }}
                          buttonProps={{
                            text: "Transfer license",
                            disabled: loading,
                          }}
                          dialogProps={{}}
                          text="Download"
                          title={"Confirm license transfer"}
                        >
                          <>
                            <p>Confirm license transfer to this machine.</p>
                            <p>
                              <strong>NOTE:</strong> After you transfer license
                              to this machine, license will not be active
                              anymore on other machines.
                            </p>
                          </>
                        </ConfirmButton>
                      </div>

                      <div style={{ padding: "15px" }}>
                        2. Buy another license for this machine.
                        <br />
                        <Button
                          disabled={loading}
                          intent="primary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const { shell } = window.require("electron");
                            shell.openExternal("http://webslider.io/prices");
                          }}
                        >
                          Purchase another license
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {!licenseDetails?.status && (
                <>
                  <div>
                    Status:{" "}
                    <span className={css.licenseStatusError}>
                      Serial Number is not found or it's not valid. Please enter
                      a Serial Number and Activate.
                      <br />
                      {/* <span>
                      <strong>Note:</strong> Application is partially disabled
                      without Serial Number.
                    </span> */}
                    </span>
                  </div>
                  <div>
                    Note:{" "}
                    <span className={css.licenseStatusError}>
                      To enable all features, restart the app after adding the
                      serial.
                      <br />
                      {/* <span>
                    <strong>Note:</strong> Application is partially disabled
                    without Serial Number.
                  </span> */}
                    </span>
                  </div>
                </>
              )}

              {licenseDetails && licenseDetails.status === "OK" && (
                <>
                  <div>
                    License:{" "}
                    <span className={css.licenseName}>
                      {getLicenseNameByType(licenseDetails.licenseType)}
                    </span>
                  </div>
                  {/* <div>
                    Subscription period:{" "}
                    <span className={css.licenseSubscriptionPlan}>
                      {getSubscriptionNameByType(
                        licenseDetails.subscriptionType
                      )}
                    </span>
                  </div> */}
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  slideDuration: state.project.settings.slideDuration,
  globals: state.globals,
});

const mapDispatchToProps = {
  _updateSlideDuration: (newValue: string) => updateSlideDuration(newValue),
  _updateGlobalConfiguration: (globals: Partial<IAppSettings>) =>
    updateGlobalConfiguration(globals),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LicenseSettingsPanel);
