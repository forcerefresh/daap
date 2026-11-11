import React, { useContext, useLayoutEffect } from "react";
import {
  Card,
  Elevation,
  H5,
  Text,
  Icon,
  Classes,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import css from "./IntroPage.module.scss";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import { useNavigate } from "react-router";
import { IntegrationContext } from "../../integration";
import { updateGlobalConfiguration } from "../../store/actions/actions";
import { IAppSettings } from "../../store/reducers/globals";

interface PageOption {
  id: "search" | "editor";
  title: string;
  description: string;
  imageClass: string;
  icon: typeof IconNames[keyof typeof IconNames];
}

type IIntroPageProps = {
  onSelect: (page: "search" | "editor") => void;
};

export type IIntroPageMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IIntroPageProps;

const IntroPage: React.FC<IIntroPageMergedProps> = ({
  theme,
  _updateGlobalConfiguration,
  globals,
}) => {
  const pageOptions: PageOption[] = [
    {
      id: "search",
      title: "Search",
      description:
        "Explore thousands of templates using DAAP's advanced search APIs. Find smart designs tailored to your needs.",
      // image: SearchPageThumb,
      imageClass: css.searchPageThumb,
      icon: IconNames.SEARCH,
    },
    {
      id: "editor",
      title: "Editor",
      description:
        "Create and customize designs directly within WordPress. Your design, your storage. No external dependencies.",
      imageClass: css.editorPageThumb,
      icon: IconNames.EDIT,
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
                <Icon icon={option.icon as any} size={24} color={(option as any).color} />
                <H5 className={Classes.HEADING}>{option.title}</H5>
              </div>

              <div className={css.optionPreview}>
                <div
                  className={`${option.imageClass} ${css.previewImageHolder}`}
                ></div>
              </div>

              <Text className={css.optionDescription} tagName="p">
                {option.description}
              </Text>
            </Card>
          ))}
        </div>

        <div className={css.footer}>
          <Text className={css.footerNote} tagName="p">
            You can change this setting later in{" "}
            <strong>Settings → App Settings</strong>
          </Text>
        </div>
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
