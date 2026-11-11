import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./AccountSettingsPanel.module.scss";
import { Button } from "@blueprintjs/core";
import axios from "axios";
import { getTextField } from "../../inputs/input-utils";
import { IAccount } from "../../store/reducers/account";
import { loadUserData } from "../../store/actions/actions";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { isEqual } from "lodash-es";
import ConfirmButton from "../../utils/components/confirm-button/confirm-button";
import { SectionHeader } from "../common/section-header/SectionHeader";

const AUTH_LOGOUT = "/logout";

enum GlobalPanelSections {
  AccountConfiguration = "accountConfiguration",
  AccountDeletion = "accountDeletion",
}

export type IAccountSettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const AccountSettingsPanel: React.FC<IAccountSettingsPanelMergedProps> = (
  props
) => {
  const { account, _loadUserData } = props;

  const [userDetails, setUserDetails] = useState<IAccount["userData"]>({
    displayName: "",
  });

  const visibleSectionIds = {
    [GlobalPanelSections.AccountConfiguration]: true,
    [GlobalPanelSections.AccountDeletion]: true,
  };

  useEffect(() => {
    setUserDetails(account.userData);
  }, [account.userData]);

  const handleAccountUpdate = () => {
    axios
      .put("/api/v1/me", { displayName: userDetails?.displayName })
      .then(function (_response) {
        _loadUserData();
        AppToaster.show({
          intent: "success",
          message: "User data has been updated.",
        });
      })
      .catch(function () {
        AppToaster.show({
          intent: "danger",
          message: "Something went wrong. Change is not saved.",
        });
      });
  };

  return (
    <div className={css.accountSettingsPanel}>
      <section>
        <SectionHeader>
          Account settings
        </SectionHeader>
        {visibleSectionIds[GlobalPanelSections.AccountConfiguration] && (
          <div className={css.panel}>
            <div className={css.group}>
              {getTextField(
                "Display name",
                userDetails?.displayName,
                (value) => {
                  setUserDetails({ ...userDetails, displayName: value ?? "" });
                }
              )}
            </div>
            <div>
              <Button
                disabled={isEqual(userDetails, account.userData)}
                loading={account.userDataLoading}
                intent={"primary"}
                onClick={handleAccountUpdate}
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </section>

      <section>
        <SectionHeader>
          Close account
        </SectionHeader>
        {visibleSectionIds[GlobalPanelSections.AccountConfiguration] && (
          <div className={css.panel}>
            <div>
              <p>
                Account close means that all your projects, uploads and user
                details will be deleted and you will be signed off from app.
              </p>
              <p>
                <strong>Please note:</strong> Uploaded data like images,
                vectors, fonts, etc. will be deleted after 15 days from account
                termination. If you prefer to delete files asap, please send as
                an email to{" "}
                <span className="bp5-monospace-text">
                  <strong>contact@forcerefresh.io</strong>
                </span>
              </p>
            </div>
            <div>
              <ConfirmButton
                onConfirm={async () => {
                  axios
                    .delete("/api/v1/me")
                    .then(function (_response) {
                      window.location.href = AUTH_LOGOUT;
                    })
                    .catch(function () {
                      AppToaster.show({
                        intent: "warning",
                        message:
                          "Something went wrong. Please reload page and try again",
                      });
                    });
                }}
                buttonProps={{}}
                dialogProps={{}}
                text="Delete my account"
                title={"Delete Account"}
                confirmText={"DELETE"}
                placeholder={"Type DELETE here"}
              >
                <>
                  <p>Deleting a account is permanent and can't be undone.</p>
                  <p>
                    <strong>Please note:</strong> Uploaded data like images,
                    vectors, fonts, etc. will be deleted after 15 days from
                    account termination. If you prefer to delete files asap,
                    please send as an email to 'contact@forcerefresh.io'
                  </p>
                  <p>
                    To confirm deletion enter "DELETE" word in the field below:
                  </p>
                </>
              </ConfirmButton>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  account: state.account,
});

const mapDispatchToProps = {
  _loadUserData: () => loadUserData(),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountSettingsPanel);
