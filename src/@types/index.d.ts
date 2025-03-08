declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// used in wp implementation
declare var daapForcerefreshSettings: {
  root: string;
  nonce: string;
  baseMediaUrl: string;
};
declare var jQuery: any;
declare var wp: any;
