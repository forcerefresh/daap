import { Text } from "@blueprintjs/core";
import css from "./SearchFooter.module.scss";

import { Link } from "react-router-dom";
const SearchFooter = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "20px 0",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >
        <Link
          to={"https://learn.daap.forcerefresh.io"}
          className={css.footerLink}
        >
          <Text style={{ display: "inline" }}>Documentation</Text>
        </Link>
        <Link
          to={"https://daap.forcerefresh.io/documents/privacy-policy.html"}
          target="_blank"
          className={css.footerLink}
        >
          <Text style={{ display: "inline" }}>Privacy Policy</Text>
        </Link>
        <Link
          to={"https://daap.forcerefresh.io/documents/terms-of-service.html"}
          target="_blank"
          className={css.footerLink}
        >
          <Text style={{ display: "inline" }}>Terms Of Use</Text>
        </Link>
      </div>
    </div>
  );
};

export default SearchFooter;
