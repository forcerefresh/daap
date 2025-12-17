import React, { useState, useEffect } from "react";
import { Text } from "@blueprintjs/core";
import css from "./HeadlineRandomizer.module.scss";
import { Link } from "react-router-dom";
const SearchFooter = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        display: "flex",
        gap: "20px",
      }}
    >
      <Link
        to={"https://demo.daap.forcerefresh.io/documentation"}
        target="_blank"
      >
        <Text style={{ display: "inline" }}>Documentation</Text>
      </Link>
      <Link
        to={
          "https://demo.daap.forcerefresh.io/public/documents/privacy-policy-v1.html"
        }
        target="_blank"
      >
        <Text style={{ display: "inline" }}>Privacy Policy</Text>
      </Link>
      <Link
        to={
          "https://demo.daap.forcerefresh.io/public/documents/terms-of-service-v1.html"
        }
        target="_blank"
      >
        <Text style={{ display: "inline" }}>Terms Of Use</Text>
      </Link>
    </div>
  );
};

export default SearchFooter;
