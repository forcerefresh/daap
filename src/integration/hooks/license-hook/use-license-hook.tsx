import { getLicenseDetailsResponse } from "../../../integration";
import { ILicenseHook } from "../../../integration/core/i-hooks";

export const useLicenseHook = (): ILicenseHook => {
  const saveSerial = async (_props: {
    serial: string;
    allowTransfer: boolean;
  }): Promise<void> => {
    return Promise.resolve();
  };

  // TODO: update any
  const getLicenseDetails = (): Promise<getLicenseDetailsResponse> => {
    const license = JSON.parse(localStorage.getItem(`license`) || "{}");

    let res = {};
    if (license?.license?.licenseDetails)
      res = JSON.parse(atob(license.license.licenseDetails));

    return Promise.resolve(res as getLicenseDetailsResponse);
  };

  return {
    saveSerial,
    getLicenseDetails,
  };
};
