import React, { useContext, useLayoutEffect, useState } from "react";
import {
  Card,
  Elevation,
  Button,
  H2,
  H5,
  Text,
  Callout,
  Intent,
  Icon,
  Classes,
  Divider,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import css from "./IntroPage.module.scss";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import SearchPageThumb from "./assets/search-page-thumb.jpg";
import EditorPageThumb from "./assets/editor-page-thumb.jpg";
import { useNavigate } from "react-router";
import { IntegrationContext } from "../../integration";
import { updateGlobalConfiguration } from "../../store/actions/actions";
import { IAppSettings } from "../../store/reducers/globals";

interface PageOption {
  id: "search" | "editor";
  title: string;
  description: string;
  imageClass: string;
  features: string[];
  icon: IconNames;
  // color: string;
}

type IIntroPageProps = {
  onSelect: (page: "search" | "editor") => void;
  //   currentSelection?: "search" | "editor";
};

export type IIntroPageMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IIntroPageProps;

const IntroPage: React.FC<IIntroPageMergedProps> = ({
  theme,
  _updateGlobalConfiguration,
  onSelect,
  globals,
  //   currentSelection = "search",
}) => {
  //   const [selectedOption, setSelectedOption] = useState<"search" | "editor">(
  //     currentSelection,
  //   );

  const pageOptions: PageOption[] = [
    {
      id: "search",
      title: "Search",
      description:
        "Explore thousands of templates using DAAP's advanced search APIs. Find smart designs tailored to your needs.",
      // image: SearchPageThumb,
      imageClass: css.searchPageThumb,
      features: [
        "Access to DAAP's extensive template library",
        "Advanced filtering and sorting",
        "Preview assets before importing",
        "API-powered search with real-time results",
      ],
      icon: IconNames.SEARCH,
      //   color: "#2D72D2",
    },
    {
      id: "editor",
      title: "Editor",
      description:
        "Create and customize designs directly within WordPress. Your design, your storage. No external dependencies.",
      // image: EditorPageThumb,
      imageClass: css.editorPageThumb,
      features: [
        "Native WordPress integration",
        "Direct editing of WordPress content",
        "Live preview capabilities",
        "No external API dependencies",
      ],
      icon: IconNames.EDIT,
      //   color: "#0F9960",
    },
  ];

  const navigate = useNavigate();

  const handleSelect = async (page: string) => {
    // save settings
    await patchSettings({
      appSettings: {
        ...globals,
        homePage: page,
      },
    });

    //update store
    _updateGlobalConfiguration({
      homePage: page,
    });

    navigate(`/${page}`); // Navigate to the selected page
  };

  useLayoutEffect(() => {
    const root = document.getElementById("daap-forcerefresh-root");
    if (root) {
      root.classList.remove(`bp5-${theme}`);
      root.classList.add(`bp5-${theme}`);
    }
  }, [theme]);

  const globalContext = useContext(IntegrationContext);
  const { patchSettings } = globalContext.useSettingsHook();

  return (
    <div className={css.outerContainer}>
      <div className={css.container}>
        <div className={css.header}>
          <div className={css.headerContent}>
            <div>
              <h3 className={css.title}>Welcome to DAAP Design Studio</h3>
              <Text className={css.subtitle} tagName="p">
                Let's set up your preferred starting point
              </Text>
            </div>
          </div>
        </div>

        <div className={css.optionsGrid}>
          {pageOptions.map((option) => (
            <Card
              key={option.id}
              interactive
              elevation={Elevation.TWO}
              className={`${css.optionCard}`}
              onClick={() => handleSelect(option.id)}
            >
              <div className={css.optionHeader}>
                <Icon icon={option.icon} size={24} color={option.color} />
                <H5 className={Classes.HEADING}>{option.title}</H5>
              </div>

              <div className={css.optionPreview}>
                {/* <option.image /> */}
                <div
                  className={`${option.imageClass} ${css.previewImageHolder}`}
                ></div>
                {/* <img
                  src={option.image}
                  alt={`${option.title} preview`}
                  className={css.previewImage}
                /> */}
                {/* <div className={css.previewOverlay}>
                  <Icon icon={IconNames.EYE_OPEN} size={20} />
                  <Text>Click to preview</Text>
                </div> */}
              </div>

              <Text className={css.optionDescription} tagName="p">
                {option.description}
              </Text>

              {/* <div className={css.optionFeatures}>
                <Text tagName="strong" className={css.featuresTitle}>
                  Key Features:
                </Text>
                <ul className={css.featuresList}>
                  {option.features.map((feature, index) => (
                    <li key={index} className={css.featureItem}>
                      <Icon
                        icon={IconNames.TICK}
                        size={14}
                        color={option.color}
                      />
                      <Text>{feature}</Text>
                    </li>
                  ))}
                </ul>
              </div> */}

              {/* <div className={css.optionFooter}>
                {selectedOption === option.id && (
                  <div className={css.selectedBadge}>
                    <Icon
                      icon={IconNames.TICK_CIRCLE}
                      intent={Intent.SUCCESS}
                    />
                    <Text>Selected</Text>
                  </div>
                )}
              </div> */}
            </Card>
          ))}
        </div>

        <div className={css.footer}>
          <Text className={css.footerNote} tagName="p">
            You can change this setting later in{" "}
            <strong>Settings → App Settings</strong>
          </Text>
        </div>
        {/* <Callout
          icon={IconNames.INFO_SIGN}
          intent={Intent.PRIMARY}
          className={css.callout}
        >
          <Text>
            Choose your default landing page below. This can be changed anytime
            in <strong>Settings → App Settings</strong> within the plugin.
          </Text>
        </Callout> */}

        {/* <Divider className={css.divider} /> */}

        {/* <div className={css.footer}>
          <div className={css.footerInfo}>
            <Callout
              icon={IconNames.LIGHTBULB}
              intent={Intent.WARNING}
              className={css.infoCallout}
            >
              <Text>
                <strong>Note for WordPress Marketplace:</strong> The Search page
                utilizes DAAP's external APIs, while the Editor provides native
                WordPress functionality. Choose based on your workflow needs.
              </Text>
            </Callout>
          </div>

          <div className={css.footerActions}>
            <Button
              large
              intent={Intent.PRIMARY}
              icon={IconNames.CONFIRM}
              onClick={handleContinue}
              className={css.continueButton}
            >
              Continue to {selectedOption === "search" ? "Search" : "Editor"}
            </Button>

            <Text className={css.footerNote} tagName="p">
              You can change this setting later in{" "}
              <strong>Settings → App Settings</strong>
            </Text>
          </div>
        </div> */}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({
  theme: state.globals.theme,
  globals: state.globals,
});

const mapDispatchToProps = {
  _updateGlobalConfiguration: (globals: Partial<IAppSettings>) =>
    updateGlobalConfiguration(globals),
};

export default connect(mapStateToProps, mapDispatchToProps)(IntroPage);
