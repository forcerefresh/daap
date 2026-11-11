import React, { useState, useContext, useEffect } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./LicenseSettingsPanel.module.scss";
import { Button } from "@blueprintjs/core";
import { getTextField } from "../../inputs/input-utils";
import { IntegrationContext } from "../../integration";
import { getLicenseNameByType } from "./license-utils";
import ConfirmButton from "../../utils/components/confirm-button/confirm-button";
import { SectionHeader } from "../common/section-header/SectionHeader";

enum GlobalPanelSections {
  LicenseConfiguration = "licenseConfiguration",
}

export type ILicenseSettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const LicenseSettingsPanel: React.FC<ILicenseSettingsPanelMergedProps> = (
  _props
) => {
  const globalContext = useContext(IntegrationContext);
  const { saveSerial, getLicenseDetails } = globalContext.useLicenseHook();

  const visibleSectionIds = {
    [GlobalPanelSections.LicenseConfiguration]: true,
  };

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
        <SectionHeader>
          License settings
        </SectionHeader>
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
                          The serial number was not found or is invalid. Please
                          enter a valid serial number and activate.
                        </span>
                        <br />
                        <div>
                          Note:{" "}
                          <span className={css.licenseStatusError}>
                            To enable all features after submitting your license
                            key, please restart the app.
                            <br />
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
                      The serial number was not found or is invalid. Please
                      enter a valid serial number and activate.
                      <br />
                    </span>
                  </div>
                  <div>
                    Note:{" "}
                    <span className={css.licenseStatusError}>
                      To enable all features after submitting your license key,
                      please restart the app. <br />
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
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const mapStateToProps = (_state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LicenseSettingsPanel);
