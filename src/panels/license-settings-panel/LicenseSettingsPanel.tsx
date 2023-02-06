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
              {getTextField("Serial Number", currentSerial, (serial) => {
                setCurrentSerial(serial);
              })}
            </div>
            <div>
              <Button
                loading={loading}
                intent={licenseDetails.status === "OK" ? "none" : "primary"}
                onClick={async () => {
                  setLoading(true);
                  await saveSerial({ serial: currentSerial });
                  const licenceDetails = await getLicenseDetails();
                  setLicenseDetails(licenceDetails);
                  setLoading(false);
                }}
              >
                {licenseDetails.status === "OK"
                  ? "Update"
                  : "Save and Activate"}
              </Button>
            </div>
            <div className={css.licenseDetails}>
              <strong>License details</strong>

              {licenseDetails && (
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
                  <div>
                    Subscription period:{" "}
                    <span className={css.licenseSubscriptionPlan}>
                      {getSubscriptionNameByType(
                        licenseDetails.subscriptionType
                      )}
                    </span>
                  </div>
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
