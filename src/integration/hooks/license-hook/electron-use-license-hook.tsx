import { getLicenseDetailsResponse } from "../../../integration";

export const useLicenseHook = () => {
  const saveSerial = (props: { serial: string }): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      const licenseData = await fetch(
        `https://subscriptions.webslider.io/check-subscription?subscription-id=${props.serial}`
      ).then((data) => data.json());

      const license = { serial: props.serial, license: licenseData };

      ipcRenderer
        .invoke("License::SaveSerialAndLicense", JSON.stringify(license))
        .then((result: any) => {
          resolve();
        });
    });
  };

  // TODO: update any
  const getLicenseDetails = (): Promise<getLicenseDetailsResponse> => {
    return new Promise(async (resolve, reject) => {
      const { ipcRenderer } = window.require("electron");
      ipcRenderer.invoke("License::GetLicenseDetails").then((result: any) => {
        resolve(result);
      });
    });
  };

  return {
    saveSerial,
    getLicenseDetails,
  };
};
