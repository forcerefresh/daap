import { getLicenseDetailsResponse } from "../../../integration";

export const useLicenseHook = () => {
  const saveSerial = (props: {
    serial: string;
    allowTransfer: boolean;
  }): Promise<void> => {
    // return new Promise(async (resolve, reject) => {
    //   const { ipcRenderer } = window.require("electron");
    //   const license = {
    //     serial: props.serial,
    //     allowTransfer: props.allowTransfer,
    //   };
    //   ipcRenderer
    //     .invoke("License::SaveSerialAndLicense", JSON.stringify(license))
    //     .then((result: any) => {
    //       resolve();
    //     });
    // });
    return Promise.resolve();
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
