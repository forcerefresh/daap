export function checkIfAssetsServiceHasError(resData: any): string | undefined {
  const status = resData.status;
  if (status) {
    let err =
      "Something went wrong. If you continue facing this error contact technical support.";

    switch (status) {
      case "DOES_NOT_EXIST":
        err =
          "Your API KEY is not valid. Go to Settings > Licenses and enter valid serial number.";
        break;
      case "EXPIRED":
        err =
          "Your subscription has expired. In order to activate services visit webslider.io website.";
        break;
    }

    return err;
  }
}
