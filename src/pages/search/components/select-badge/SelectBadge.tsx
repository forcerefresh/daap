import React from "react";
import { HTMLSelect } from "@blueprintjs/core";
import styles from "./SelectBadge.module.scss"; // Adjust import path as needed

interface Option {
  value: string;
  label: string;
}

interface SplitBadgeSelectorProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minimal?: boolean;
}

const SplitBadgeSelector: React.FC<SplitBadgeSelectorProps> = ({
  label,
  options,
  value,
  onChange,
  className = "",
  minimal = true,
}) => {
  return (
    <div className={`${styles.languageSelector} ${className}`}>
      <div className={styles.splitBadge}>
        <span className={styles.badgeLeft}>{label}</span>
        <div className={styles.badgeRight}>
          <HTMLSelect
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={styles.languageSelect}
            minimal={minimal}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </HTMLSelect>
        </div>
      </div>
    </div>
  );
};

export default SplitBadgeSelector;
