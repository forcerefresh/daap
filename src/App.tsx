import React, { useContext, useEffect, useLayoutEffect } from "react";
import { connect } from "react-redux";
//import "./App.scss";
import "./AppNew.scss";
import { IntegrationContext } from "./integration";
import { loadAndRegisterExternalComponent } from "./objects/external-object-utils";
import Editor from "./pages/editor/Editor";
import {
  activateSlide,
  doClearHistory,
  initializeSlideAndLayer,
  loadUserData,
  openProject,
  selectForProperties,
  selectForPropertiesProps,
  selectSlides,
  setAIEnabled,
  setDevice,
  setMyFonts,
  updateEditor,
  updateGlobalConfiguration,
  updateProjectMeta,
} from "./store/actions/actions";
import { IStore } from "./store/store";

import gsap from "gsap";
import animejs from "animejs";
import { AppToaster } from "./utils/components/app-toaster/AppToaster";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import axios from "axios";
import { GlobalEventsProvider } from "./utils/global-events/GlobalEvents";
import {
  getMissingExtensionsFromProject,
  getOutdatedExtensions,
} from "./utils/extensions/extensions-utils";
import { IEditor } from "./store/reducers/editor";
import { last, omit } from "lodash-es";
import { getLatestVersionsMap } from "./objects/objectToolFactory";
import { useLocation } from "react-router";
import { usePublicTemplate } from "./template-generator/hooks/usePublicTemplate";
import { useSearchParams } from "react-router-dom";
import { ISettings } from "./store/reducers/i-settings";
import { IPages } from "./store/reducers/i-pages";
import { IMeta } from "./store/reducers/meta";
import { preloadFonts } from "./utils/project/project-utils";
import { generateFilename } from "./panels/create-panel/utils";
import { useWPPublicTemplate } from "./template-generator/hooks/useWPPublicTemplate";

gsap.install(window);
(window as any).animejs = animejs;

type IAppProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & { className?: string };

function App(props: IAppProps) {
  const {
    isAuthenticated,
    _initializeSlideAndLayer,
    _updateGlobalConfiguration,
    _doClearHistory,
    _loadUserData,
    _setMyFonts,
    _setAIEnabled,
    _updateEditor,
    theme,
    className,
    _updateProjectMeta,
    _openProject,
    _setDevice,
    _activateSlide,
    _selectForProperties,
    _selectSlides,
  } = props;

  // const { template, language } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const template = searchParams.get("template");
  const language = searchParams.get("language");

  const { getPublicTemplate: getSaaSPublicTemplate } = usePublicTemplate();
  const { getPublicTemplate: getWPPublicTemplate } = useWPPublicTemplate();

  const getPublicTemplate =
    import.meta.env.VITE_APP_INTEGRATION === "wp"
      ? getWPPublicTemplate
      : getSaaSPublicTemplate;

  // Load post based on ID

  const applyTemplate = (templateProject: any, documentTypeStr: string) => {
    // debugger;

    const meta: IMeta = {
      id: undefined, //response.project.id,
      name: generateFilename(documentTypeStr),
      description: "",
      // modified: response.template.modified,
      // created: response.template.created,
      saveRevision: 0,
      //publishRevision: response.project.publishRevision,
    };
    _updateProjectMeta(meta);

    const project: {
      // NOTE: there are other props. We need only settings from project
      settings: ISettings;
      slides: IPages;
    } = templateProject;

    // const { updatedProject, fromToIds } = updateProjectWithNewIds(project);

    const updatedProject = templateProject;

    _openProject(updatedProject);

    _setDevice(
      [...updatedProject.settings.breakpoints.breakpointsConfiguration]
        .reverse()
        .find((bc) => bc.enabled)?.type || "device-independent"
    );

    // missing extensions >>>
    const missingExtensions = getMissingExtensionsFromProject(
      templateProject.extensions
    );
    _updateEditor({ missingExtensions });
    if (missingExtensions.length > 0) {
      AppToaster.show({
        intent: "warning",
        message:
          "Missing Extension found! Go to Library > Extensions to install missing extensions.",
      });
    }
    // missing extensions <<<

    _doClearHistory();

    const slideIdToSelect = updatedProject.pages.pages[0];
    if (slideIdToSelect) {
      _activateSlide(slideIdToSelect);
      _selectSlides([slideIdToSelect]);
      _selectForProperties({ id: slideIdToSelect, type: "slide" });
    }

    _updateEditor({ sliderChanged: false, isExistingProject: false });

    _doClearHistory();

    preloadFonts(templateProject?.fonts ?? []);

    // _createNewProject();
    // _doClearHistory();
    // _initializeSlideAndLayer();
    // _updateEditor({ isExistingProject: false, sliderChanged: false });
    // if (isDiscartConfirmOpen) {
    //   setIsDiscartConfirmOpen(false);
    // }
    setSearchParams({});

    setTimeout(() => {
      _updateEditor({ sliderChanged: false });
    }, 100);
  };

  useEffect(() => {
    if (
      !template ||
      (!isAuthenticated && import.meta.env.VITE_APP_INTEGRATION === "saas")
    ) {
      return;
    }

    getPublicTemplate(template, language ? language : "en").then((response) => {
      if (response?.data?.template) {
        const docType = response?.data?.documentTypeId ?? "Custom";

        applyTemplate(
          JSON.parse(response?.data?.template),
          last(docType.split(":")) ?? "Document"
        );
      } else {
        console.warn("Something went wrong!");
      }
    });
  }, [template, language, isAuthenticated]);

  const globalContext = useContext(IntegrationContext);

  const { getInstalledExtensions, getExtensions } =
    globalContext.useExtensionsHook();
  // const { getSettings: getAppSettings, scaleUI } =
  //   globalContext.useAppSettingsHook();

  const { getSettings, scaleUI } = globalContext.useSettingsHook();

  const { fetchMedias } = globalContext.useMyMediaHook();

  globalContext.useExitHook();

  const loadMyFonts = () => {
    fetchMedias({
      type: "font",
      tags: [],
      from: 1,
      perPage: 200,
    }).then(
      (result) => {
        _setMyFonts(result.data);
      },

      (error) => {
        logger.app.error(error);
      }
    );
  };

  useEffect(() => {
    // **
    _initializeSlideAndLayer();
    _doClearHistory();

    // **
    const loadExternalComponents = async () => {
      const installedExtensions = await getInstalledExtensions();

      const latestInstalledExtensions = Array.from(
        getLatestVersionsMap(installedExtensions.data).values()
      );

      getExtensions(0).then((extensionsRest) => {
        const extensions = extensionsRest.data;

        const outdatedExtensions = getOutdatedExtensions(
          extensions,
          installedExtensions.data
        );

        _updateEditor({ outdatedExtensions });
      });

      for (let i = 0; i < latestInstalledExtensions.length; i++) {
        try {
          await loadAndRegisterExternalComponent(latestInstalledExtensions[i]);
        } catch (ex) {
          console.error(ex);
        }
      }
    };
    loadExternalComponents().then(() => {});

    //**
    // getAppSettings().then((settings) => {
    //   if (settings) {
    //     _updateGlobalConfiguration(settings);
    //     scaleUI(settings.appZoom);
    //   }
    // });

    _loadUserData();

    loadMyFonts();
  }, []);

  // disable pinch
  useEffect(() => {
    window.addEventListener(
      "wheel",
      (e) => {
        if ((e.target as Element).closest(".no-custom-cursor")) {
        } else if ((e.target as Element).closest(".layout-content-area")) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }, []);

  // global errors
  useEffect(() => {
    const globalErrorCallback = (event: Event) => {
      const customEvent = event as CustomEvent;
      AppToaster.show({
        intent: "warning",
        message: customEvent.detail.message,
      });
    };

    window.addEventListener("GLOBAL_ERROR", globalErrorCallback);
    return () =>
      window.removeEventListener("GLOBAL_ERROR", globalErrorCallback);
  }, []);

  useLayoutEffect(() => {
    const root = document.getElementById("daap-forcerefresh-root");
    if (root) {
      root.className = `bp5-${theme}`;
    }
  }, [theme]);

  // load ai info
  useEffect(() => {
    const appZoom = localStorage.getItem(`appZoom`);
    if (appZoom) {
      scaleUI(Number(appZoom));
    }

    getSettings().then(function (response) {
      const textEnabled = (response.textAISettings ?? {}).enabled;
      _setAIEnabled([
        { enabled: textEnabled, objectType: "io.forcerefresh.text.object" },
      ]);

      if (response.appSettings) {
        _updateGlobalConfiguration({
          ...omit(response.appSettings, "appVersion"), // TODO: this is a quick fix
          publishSettings: response.publishSettings,
        });

        scaleUI(response.appSettings.appZoom ?? 1);
      } else {
        scaleUI(1);
      }
    });
  }, []);

  useEffect(() => {
    document.addEventListener("contextmenu", function (e) {
      if ((e.target as HTMLElement).closest(".daap-forcerefresh-app")) {
        // TODO: enable this
        // e.preventDefault();
      }
    });
  }, []);

  return (
    <div className={`${className}`}>
      <GlobalEventsProvider>
        <Editor />
      </GlobalEventsProvider>
    </div>
  );
}

const mapStateToProps = (state: IStore) => {
  const { pages, selection } = state.project;
  return {
    pageById: pages.pageById,
    selectedSlideIds: selection.selectedSlideIds,
    activeSlideId: selection.activeSlideId,
    theme: state.globals.theme,
    isAuthenticated:
      !!state.account.userData?.displayName && !state.account.userDataLoading,
  };
};

const mapDispatchToProps = {
  _initializeSlideAndLayer: initializeSlideAndLayer,
  _updateGlobalConfiguration: updateGlobalConfiguration,
  _doClearHistory: () => doClearHistory(),
  _loadUserData: () => loadUserData(),
  _setMyFonts: (myFonts: SaaSMediaData[]) => setMyFonts(myFonts),
  _setAIEnabled: (payload: { objectType: string; enabled: boolean }[]) =>
    setAIEnabled(payload),

  _updateEditor: (editor: Partial<IEditor>) => updateEditor(editor),

  _updateProjectMeta: (meta: Partial<IMeta>) => updateProjectMeta(meta),
  _openProject: (project: any) => openProject(project),
  _setDevice: setDevice,
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
