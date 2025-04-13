import React, { useCallback, useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import css from "./AITextSettingsPanel.module.scss";
import { Button } from "@blueprintjs/core";
import axios from "axios";
import {
  getCheckboxField,
  getPasswordField,
  getSelectField,
  getTextArea,
  getTextField,
} from "../../inputs/input-utils";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { cloneDeep } from "lodash-es";
import { setAIEnabled } from "../../store/actions/actions";
import { TEXT } from "../../objects/text/text";
import { IntegrationContext } from "../../integration";

interface ITextAISettings {
  enabled: boolean;
  provider?: string;
  providerConfig?: {
    replicate?: {
      model?: string;
    };
  };
  key?: string;
  promptFixGrammar?: string;
  promptShorten?: string;
  promptLonger?: string;
  promptInformal?: string;
  promptFormal?: string;
  promptCustom?: string;
}

const formDefaults = {
  enabled: false,
  provider: "",
  key: "",
  providerConfig: {
    replicate: {
      model: "meta/meta-llama-3-70b-instruct",
    },
  },
  promptFixGrammar: "Please fix the grammar in the following text.",
  promptShorten: "Please shorten the following text.",
  promptLonger:
    "Please review the following sentence and enhance it by expanding the text to be more detailed.",
  promptInformal: "Please rewrite following text in the informal/causal style.",
  promptFormal: "Please rewrite following text in the formal style.",
  promptCustom: "Please craft a catchy slogan for a marketing agency.",
} satisfies ITextAISettings;

const aiProviders = [
  {
    label: "Select AI provider...",
    value: "",
  },
  {
    label: "Replicate",
    value: "replicate",
  },
  {
    label: "Deep Seek",
    value: "deepseek",
  },
  {
    label: "Open AI",
    value: "openai",
  },
];

// enum GlobalPanelSections {
//   Api = "api",
//   Prompts = "prompts",
// }

export type IAITextSettingsPanelMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const AITextSettingsPanel: React.FC<IAITextSettingsPanelMergedProps> = (
  props
) => {
  const { _setAIEnabled } = props;

  const globalContext = useContext(IntegrationContext);
  const { useSettingsHook } = globalContext;
  const { getSettings, patchSettings } = useSettingsHook();

  const [formData, setFormData] = useState<ITextAISettings>({
    ...formDefaults,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);

    getSettings()
      .then(function (response) {
        setLoading(false);
        setFormData({ ...formData, ...(response.textAISettings ?? {}) });
      })
      .catch(function (error) {
        setLoading(false);
        AppToaster.show({
          intent: "danger",
          message: "Something went wrong. Change is not saved.",
        });
      });
  }, [setFormData]);

  // const [visibleSectionIds, _setVisibleSectionIds] = useState<{
  //   [key: string]: boolean;
  // }>({
  //   [GlobalPanelSections.Api]: true,
  //   [GlobalPanelSections.Prompts]: true,
  // });

  const handleAIUpdate = useCallback(() => {
    const formDataToSend = cloneDeep(formData);
    // if (formDataToSend.key && formDataToSend.key.indexOf("***") !== -1) {
    //   delete formDataToSend.key;
    // }

    setSaving(true);

    patchSettings({ textAISettings: formDataToSend })
      .then(function (response) {
        //_ TODO: loadAiData();

        setSaving(false);

        _setAIEnabled([{ objectType: TEXT, enabled: formDataToSend.enabled }]);

        AppToaster.show({
          intent: "success",
          message: "AI data has been updated.",
        });
      })
      .catch(function (error) {
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
    <div className={css.aiSettingsPanel}>
      <section>
        <div
          className={css.sectionHeader}
          onClick={() => {
            //toggleSection(GlobalPanelSections.AccountConfiguration)
          }}
        >
          {/*<Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.AccountConfiguration]
                ? "caret-down"
                : "caret-right"
            }
        ></Button>*/}
          Configuration
        </div>
        {
          //visibleSectionIds[GlobalPanelSections.Api] &&
          <div className={css.panel}>
            <div className={css.group}>
              {getCheckboxField(
                "Enable AI assistant",
                formData.enabled,
                (value) => {
                  setFormData({ ...formData, enabled: value });
                }
              )}
              {formData.enabled && (
                <>
                  {getSelectField(
                    "AI provider",
                    formData?.provider,
                    aiProviders,
                    (value) => {
                      setFormData({ ...formData, provider: value });
                    }
                  )}

                  {formData.provider === "replicate" && (
                    <div className={css.group}>
                      {getTextField(
                        "Replicate model",
                        formData?.providerConfig?.replicate?.model ?? "",
                        (value) => {
                          const newAiData = cloneDeep(formData);
                          newAiData.providerConfig = {
                            replicate: {
                              model: value,
                            },
                          };
                          setFormData(newAiData);
                        },
                        "Recommended models: meta/meta-llama-3-70b-instruct, meta/meta-llama-3-8b-instruct, deepseek-ai/deepseek-r1"
                      )}
                    </div>
                  )}

                  {formData.provider && (
                    <>
                      <div className={css.group}>
                        {getPasswordField(
                          "API Key",
                          formData?.key,
                          (value) => {
                            setFormData({ ...formData, key: value ?? "" });
                          },
                          "API keys are typically created through the platform or service provided by the AI provider."
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div>
              <Button
                loading={saving}
                intent={"primary"}
                onClick={handleAIUpdate}
              >
                Update
              </Button>
            </div>
          </div>
        }
      </section>

      {formData.enabled && (
        <section>
          <div
            className={css.sectionHeader}
            onClick={() => {
              //toggleSection(GlobalPanelSections.AccountConfiguration)
            }}
          >
            {/*<Button
            minimal
            small={true}
            icon={
              visibleSectionIds[GlobalPanelSections.AccountConfiguration]
                ? "caret-down"
                : "caret-right"
            }
        ></Button>*/}
            Prompt templates
          </div>
          {
            //visibleSectionIds[GlobalPanelSections.Prompts] &&
            <div className={css.panel}>
              <div style={{ marginBottom: "20px" }}>
                <label>
                  NOTE: During API execution the DAAP software modifies the
                  prompt template by appending instructions that direct the AI
                  to encapsulate its response within predefined delimiters. This
                  ensures DAAP can parse the AI-generated text and extract the
                  result from it.
                </label>
              </div>
              <div>
                {getTextArea(
                  "Fix grammar",
                  formData.promptFixGrammar,
                  (value) => {
                    setFormData({ ...formData, promptFixGrammar: value });
                  },
                  "Keep text as is just fix the grammar if exist"
                )}
              </div>
              <div>
                {getTextArea(
                  "Shorten",
                  formData.promptShorten,
                  (value) => {
                    setFormData({ ...formData, promptShorten: value });
                  },
                  "Rewrite text to get it shorter."
                )}
              </div>
              <div>
                {getTextArea(
                  "Longer",
                  formData.promptLonger,
                  (value) => {
                    setFormData({ ...formData, promptLonger: value });
                  },
                  "Rewrite text to get it longer."
                )}
              </div>
              <div>
                {getTextArea(
                  "Informal",
                  formData.promptInformal,
                  (value) => {
                    setFormData({ ...formData, promptInformal: value });
                  },
                  "Rewrite text in informal style."
                )}
              </div>
              <div>
                {getTextArea(
                  "Formal",
                  formData.promptFormal,
                  (value) => {
                    setFormData({ ...formData, promptFormal: value });
                  },
                  "Rewrite text in formal style."
                )}
              </div>
              <div>
                {getTextArea(
                  "Custom request",
                  formData.promptCustom,
                  (value) => {
                    setFormData({ ...formData, promptCustom: value });
                  },
                  "Default prompt fo for custom request"
                )}
              </div>
              <div>
                <Button
                  loading={saving}
                  intent={"primary"}
                  onClick={handleAIUpdate}
                >
                  Update
                </Button>
              </div>
            </div>
          }
        </section>
      )}
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {
  _setAIEnabled: (
    payload: {
      objectType: string;
      enabled: boolean;
    }[]
  ) => setAIEnabled(payload),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AITextSettingsPanel);
