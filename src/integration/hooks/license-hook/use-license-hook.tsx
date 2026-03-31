import { getLicenseDetailsResponse } from "../../../integration";

export const useLicenseHook = () => {
  const saveSerial = async (props: {
    serial: string;
    allowTransfer: boolean;
  }): Promise<void> => {
    // const license = JSON.parse(localStorage.getItem(`license`) || "{}");

    // license.serial = props.serial;

    // const licenseData = await fetch(
    //   `https://subscriptions.webslider.io/check-subscription?subscription-id=${props.serial}`
    // ).then((data) => data.json());

    // license.license = licenseData;

    // localStorage.setItem(`license`, JSON.stringify(license));

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
