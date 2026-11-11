import { useContext, useEffect, useLayoutEffect } from "react";
import { connect } from "react-redux";
import "./global.scss";
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

import animejs from "animejs";
import { AppToaster } from "./utils/components/app-toaster/AppToaster";
import { logger } from "webslider-sdk/lib/utils/logger/logger";
import { SaaSMediaData } from "webslider-sdk/lib/common/i-media-types";
import { GlobalEventsProvider } from "./utils/global-events/GlobalEvents";
import {
  getMissingExtensionsFromProject,
  getOutdatedExtensions,
} from "./utils/extensions/extensions-utils";
import { IEditor } from "./store/reducers/editor";
import { last, omit } from "lodash-es";
import { getLatestVersionsMap } from "./objects/objectToolFactory";
import { usePublicTemplate } from "@platform/hooks/public-template";
import { platformFlags } from "@platform/platform-flags";
import { useSearchParams } from "react-router-dom";

import { IMeta } from "./store/reducers/meta";
import { preloadFonts } from "./utils/project/project-utils";
import { generateFilename } from "./panels/create-panel/utils";
import { useFullscreen } from "./integration/hooks/fullscreen-hook/fullscreen-hook";

window.animejs = animejs;

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
    appZoom: appZoomFromStore,
    fullScreen,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const template = searchParams.get("template");
  const language = searchParams.get("language");

  const { getPublicTemplate } = usePublicTemplate();

  // Load post based on ID

  const applyTemplate = (templateProject: any, documentTypeStr: string) => {
    const meta: IMeta = {
      id: undefined,
      name: generateFilename(documentTypeStr),
      description: "",
      saveRevision: 0,
    };
    _updateProjectMeta(meta);

    const updatedProject = templateProject;

    _openProject(updatedProject);

    _setDevice(
      [...updatedProject.settings.breakpoints.breakpointsConfiguration]
        .reverse()
        .find((bc) => bc.enabled)?.type || "device-independent",
    );

    // missing extensions >>>
    const missingExtensions = getMissingExtensionsFromProject(
      templateProject.extensions,
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

    setSearchParams({});

    setTimeout(() => {
      _updateEditor({ sliderChanged: false });
    }, 100);
  };

  useEffect(() => {
    if (
      !template ||
      (!isAuthenticated && platformFlags.requiresAuth)
    ) {
      return;
    }

    getPublicTemplate(template, language ? language : "en").then((response) => {
      if (response?.data?.template) {
        const docType = response?.data?.documentTypeId ?? "Custom";

        applyTemplate(
          JSON.parse(response?.data?.template),
          last(docType.split(":")) ?? "Document",
        );
      } else {
        logger.app.warn("getPublicTemplate: unexpected empty response");
      }
    });
  }, [template, language, isAuthenticated]);

  const globalContext = useContext(IntegrationContext);

  const { getSettings, scaleUI } = globalContext.useSettingsHook();

  useFullscreen(fullScreen, scaleUI, appZoomFromStore);

  const { getInstalledExtensions, getExtensions } =
    globalContext.useExtensionsHook();

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
        _setMyFonts(result.data as unknown as SaaSMediaData[]);
      },

      (error) => {
        logger.app.error(error);
      },
    );
  };

  useEffect(() => {
    _initializeSlideAndLayer();
    _doClearHistory();

    const loadExternalComponents = async () => {
      const installedExtensions = await getInstalledExtensions();

      const latestInstalledExtensions = Array.from(
        getLatestVersionsMap(installedExtensions.data ?? []).values(),
      );

      getExtensions(0).then((extensionsRest) => {
        const extensions = extensionsRest.data ?? [];

        const outdatedExtensions = getOutdatedExtensions(
          extensions,
          installedExtensions.data ?? [],
        );

        _updateEditor({ outdatedExtensions });
      });

      for (let i = 0; i < latestInstalledExtensions.length; i++) {
        try {
          await loadAndRegisterExternalComponent(latestInstalledExtensions[i]);
        } catch (ex) {
          logger.app.error(ex);
        }
      }
    };
    loadExternalComponents().then(() => {});

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
      { passive: false },
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
      root.classList.remove(`bp5-${theme}`);
      root.classList.add(`bp5-${theme}`);
    }
  }, [theme]);

  // load ai info
  useEffect(() => {
    const appZoom = localStorage.getItem(`appZoom`);
    if (appZoom) {
      scaleUI(Number(appZoom));
    }

    getSettings().then(function (response) {
      const textAISettings = response.textAISettings as { enabled?: boolean } | undefined;
      const appSettings = response.appSettings as Record<string, unknown> & { appZoom?: number } | undefined;
      const textEnabled = (textAISettings ?? {}).enabled ?? false;
      _setAIEnabled([
        { enabled: textEnabled, objectType: "io.forcerefresh.text.object" },
      ]);

      if (appSettings) {
        _updateGlobalConfiguration({
          ...omit(appSettings, "appVersion"), // TODO: this is a quick fix
          publishSettings: response.publishSettings as { enabled: boolean; name?: string; endpoint?: string; key?: string; secretKey?: string } | undefined,
        });

        scaleUI(appSettings.appZoom ?? 1);
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
    fullScreen: state.editor.fullScreen,
    appZoom: state.globals.appZoom,
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
  _openProject: (project: Parameters<typeof openProject>[0]) => openProject(project),
  _setDevice: setDevice,
  _activateSlide: (id: string): any => activateSlide(id),
  _selectSlides: (ids: string[]): any => selectSlides(ids),
  _selectForProperties: (payload: selectForPropertiesProps) =>
    selectForProperties(payload),
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
