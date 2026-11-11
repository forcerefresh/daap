import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, InputGroup, Intent, Spinner } from "@blueprintjs/core";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { DrawerShell } from "../common/drawer-shell/DrawerShell";
import { unregisterPlugin } from "webslider-sdk/lib/plugins/plugins-register";
import { IServerPlugin } from "../../integration/core/i-hooks";
import css from "./PluginsPanel.module.scss";

interface IPluginsPanelProps {
  onRequestClose: () => void;
}

const PluginsPanel: React.FC<IPluginsPanelProps> = () => {
  const globalContext = useContext(IntegrationContext);
  const {
    loadPlugins,
    getAvailablePlugins,
    getInstalledPlugins,
    installPlugin,
    uninstallPlugin,
    uploadPlugin,
  } = globalContext.usePluginsHook();

  const [available, setAvailable] = useState<IServerPlugin[]>([]);
  const [installed, setInstalled] = useState<IServerPlugin[]>([]);
  const [installingTypes, setInstallingTypes] = useState<Record<string, boolean>>({});
  const [isUninstallOpen, setIsUninstallOpen] = useState(false);
  const [isUninstallLoading, setIsUninstallLoading] = useState(false);
  const uninstallTargetRef = useRef<IServerPlugin | undefined>();

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("");
  const [uploadVersion, setUploadVersion] = useState("1.0.0");
  const [isUploading, setIsUploading] = useState(false);

  const refreshInstalled = () =>
    getInstalledPlugins().then(setInstalled);

  useEffect(() => {
    getAvailablePlugins().then(setAvailable);
    refreshInstalled();
  }, []);

  const isInstalled = (type: string) =>
    installed.some((p) => p.type === type);

  const installedRecord = (type: string) =>
    installed.find((p) => p.type === type);

  const onInstall = async (plugin: IServerPlugin) => {
    setInstallingTypes((prev) => ({ ...prev, [plugin.type]: true }));
    try {
      await installPlugin(plugin);
      await loadPlugins();
      await refreshInstalled();
      AppToaster.show({ intent: "success", message: `"${plugin.name}" installed.` });
    } catch (err) {
      AppToaster.show({ intent: "danger", message: `Failed to install "${plugin.name}".` });
    } finally {
      setInstallingTypes((prev) => ({ ...prev, [plugin.type]: false }));
    }
  };

  const onUninstallClick = (plugin: IServerPlugin) => {
    uninstallTargetRef.current = plugin;
    setIsUninstallOpen(true);
  };

  const onUninstallConfirm = async () => {
    const target = uninstallTargetRef.current;
    if (!target) return;
    setIsUninstallLoading(true);
    try {
      const record = installedRecord(target.type);
      if (record) {
        await uninstallPlugin(record.id);
        unregisterPlugin(target.type);
      }
      await refreshInstalled();
      AppToaster.show({ intent: "success", message: `"${target.name}" uninstalled.` });
    } catch (err) {
      AppToaster.show({ intent: "danger", message: `Failed to uninstall "${target.name}".` });
    } finally {
      setIsUninstallLoading(false);
      setIsUninstallOpen(false);
    }
  };

  const onUpload = async () => {
    if (!uploadFile || !uploadType || !uploadVersion) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileBase64 = e.target?.result as string;
        const { scriptUrl } = await uploadPlugin(fileBase64, uploadFile.name, uploadType, uploadVersion);
        await installPlugin({ id: "", type: uploadType, version: uploadVersion, name: uploadType, scriptUrl });
        await loadPlugins();
        await refreshInstalled();
        setUploadFile(null);
        setUploadType("");
        AppToaster.show({ intent: "success", message: "Plugin uploaded and installed." });
      };
      reader.readAsDataURL(uploadFile);
    } catch (err) {
      AppToaster.show({ intent: "danger", message: "Upload failed." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DrawerShell title="PLUGINS" className={css.pluginsPanel}>
      <div className={css.mainSection}>
        {available.length === 0 && <Spinner size={30} />}
        {available.map((plugin) => (
          <div key={plugin.type} className={css.tableRow}>
            <div className={css.nameAndDesc}>
              <div className={css.name}>{plugin.name}</div>
              <div className={css.version}>{plugin.version}</div>
              <div className={css.description}>{plugin.description}</div>
              {isInstalled(plugin.type) && (
                <div className={css.installedBadge}>INSTALLED</div>
              )}
            </div>
            <div className={css.action}>
              {!isInstalled(plugin.type) && (
                <Button
                  intent="primary"
                  disabled={!!installingTypes[plugin.type]}
                  onClick={() => onInstall(plugin)}
                >
                  {installingTypes[plugin.type] ? "Installing..." : "Install"}
                </Button>
              )}
              {isInstalled(plugin.type) && (
                <Button intent="none" onClick={() => onUninstallClick(plugin)}>
                  Uninstall
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={css.uploadSection}>
        <h4>Upload custom plugin</h4>
        <div className={css.uploadRow}>
          <div className={css.uploadField}>
            <label>Plugin bundle (.js)</label>
            <input
              type="file"
              accept=".js"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className={css.uploadField}>
            <label>Type ID</label>
            <InputGroup
              value={uploadType}
              placeholder="com.example.my-plugin"
              onChange={(e) => setUploadType(e.currentTarget.value)}
            />
          </div>
          <div className={css.uploadField}>
            <label>Version</label>
            <InputGroup
              value={uploadVersion}
              placeholder="1.0.0"
              onChange={(e) => setUploadVersion(e.currentTarget.value)}
            />
          </div>
          <Button
            intent="primary"
            disabled={!uploadFile || !uploadType || !uploadVersion || isUploading}
            onClick={onUpload}
          >
            {isUploading ? "Uploading..." : "Upload & Install"}
          </Button>
        </div>
      </div>

      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Uninstall"
        canOutsideClickCancel={false}
        icon="trash"
        loading={isUninstallLoading}
        intent={Intent.DANGER}
        isOpen={isUninstallOpen}
        onCancel={() => setIsUninstallOpen(false)}
        onConfirm={onUninstallConfirm}
        className="bp5-dark"
      >
        <p>
          Are you sure you want to uninstall <b>{uninstallTargetRef.current?.name}</b>?
        </p>
      </Alert>
    </DrawerShell>
  );
};

export default PluginsPanel;
