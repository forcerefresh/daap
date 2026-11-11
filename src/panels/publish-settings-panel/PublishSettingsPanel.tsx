import React, { useCallback, useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./PublishSettingsPanel.module.scss";
import { Button } from "@blueprintjs/core";
import {
  getCheckboxField,
  getTextField,
} from "../../inputs/input-utils";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { cloneDeep } from "lodash-es";
import { updateGlobalConfiguration } from "../../store/actions/actions";
import { IntegrationContext } from "../../integration";
import { SectionHeader } from "../common/section-header/SectionHeader";

interface IPublishSettings {
  enabled: boolean;
  bucketName?: string;
  region?: string;
  endpoint: string;
  key: string;
  secretKey: string;
}

const formDefaults = {
  enabled: false,
  bucketName: "",
  endpoint: "",
  key: "",
  secretKey: "",
} satisfies IPublishSettings;

export type IPublishSettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const PublishSettingsPanel: React.FC<IPublishSettingsPanelMergedProps> = (
  props
) => {
  const { _updateGlobalConfiguration } = props;
  const globalContext = useContext(IntegrationContext);
  const { useSettingsHook } = globalContext;
  const { getSettings, patchSettings } = useSettingsHook();

  const [formData, setFormData] = useState<IPublishSettings>({
    ...formDefaults,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);

    getSettings()
      .then(function (response) {
        setLoading(false);
        setFormData({ ...formData, ...(response.publishSettings ?? {}) });
      })
      .catch(function () {
        setLoading(false);
        AppToaster.show({
          intent: "danger",
          message: "Something went wrong. Change is not saved.",
        });
      });
  }, [setFormData]);

  const handleUpdate = useCallback(() => {
    const formDataToSend = cloneDeep(formData);

    setSaving(true);

    patchSettings({ publishSettings: formDataToSend as unknown as Record<string, unknown> })
      .then(function () {
        setSaving(false);

        _updateGlobalConfiguration({ publishSettings: formDataToSend });

        AppToaster.show({
          intent: "success",
          message: "AI data has been updated.",
        });
      })
      .catch(function () {
        setSaving(false);

        AppToaster.show({
          intent: "danger",
          message: "Something went wrong. Change is not saved.",
        });
      });
  }, [formData]);

  if (loading) {
    return <section>Loading...</section>;
  }

  return (
    <div className={css.publishSettingsPanel}>
      <section>
        <SectionHeader>
          Publish Configuration
        </SectionHeader>
        <div className={css.panel}>
            <div className={css.group}>
              {getCheckboxField("Enable", formData.enabled, (value) => {
                setFormData({ ...formData, enabled: value });
              })}
              {formData.enabled && (
                <>
                  <div className={css.group}>
                    {getTextField(
                      "Bucket Name",
                      formData?.bucketName ?? "",
                      (value) => {
                        const newData = cloneDeep(formData);
                        newData.bucketName = value;
                        setFormData(newData);
                      }
                    )}
                  </div>

                  <div className={css.group}>
                    {getTextField("Region", formData?.region ?? "", (value) => {
                      const newData = cloneDeep(formData);
                      newData.region = value;
                      setFormData(newData);
                    })}
                  </div>

                  <div className={css.group}>
                    {getTextField(
                      "Endpoint",
                      formData?.endpoint ?? "",
                      (value) => {
                        const newData = cloneDeep(formData);
                        newData.endpoint = value;
                        setFormData(newData);
                      }
                    )}
                  </div>

                  <div className={css.group}>
                    {getTextField("Key", formData?.key ?? "", (value) => {
                      const newData = cloneDeep(formData);
                      newData.key = value;
                      setFormData(newData);
                    })}
                  </div>

                  <div className={css.group}>
                    {getTextField(
                      "Secret key",
                      formData?.secretKey ?? "",
                      (value) => {
                        const newData = cloneDeep(formData);
                        newData.secretKey = value;
                        setFormData(newData);
                      }
                    )}
                  </div>
                </>
              )}
            </div>
            <div>
              <Button
                loading={saving}
                intent={"primary"}
                onClick={handleUpdate}
              >
                Update
              </Button>
            </div>
          </div>
      </section>
    </div>
  );
};

const mapStateToProps = (_state: IStore) => ({});

const mapDispatchToProps = {
  _updateGlobalConfiguration: updateGlobalConfiguration,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PublishSettingsPanel);
