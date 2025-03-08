import React from "react";
import { getMyUploadComponentProps } from "../../../integration";

import { WpMyImageSelect_WpDialog } from "./wp/wp-my-image-select-wpdialog";
import { WpMyImageSelect_Upload } from "./wp/wp-my-image-select-upload";

export const WpMyImageSelect: React.FC<getMyUploadComponentProps> = (props) => {
  if (props.type === "font") {
    return <WpMyImageSelect_Upload {...props} />;
  }

  return <WpMyImageSelect_WpDialog {...props} />;
};
