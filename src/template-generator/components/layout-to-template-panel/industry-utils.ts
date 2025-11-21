// import { Industry } from "../../hooks/useIndustry";

import { Industry } from "../../types/industry";

export function getIndustriesOptionFromThree(industries: Industry[]) {
  const industriesOptions = industries.reduce<
    {
      label: string;
      value: string;
      fullPath: string;
    }[]
  >((acc, cur, idx) => {
    const label = cur.id + " " + cur.name;
    acc.push({ label, value: cur.id, fullPath: label });

    return cur.children.reduce((acc2, cur2, idx2) => {
      const label2 = idx + 1 + "." + (idx2 + 1) + ".";
      acc2.push({
        label:
          "  " +
          cur2.id +
          " " +
          // cur.name +
          // " - " +
          cur2.name,
        value: cur2.id,
        fullPath: label + " > " + label2 + " " + cur2.name,
      });

      return cur2.children.reduce((acc3, cur3, idx3) => {
        const label3 = idx + 1 + "." + (idx2 + 1) + "." + (idx3 + 1) + ".";

        acc2.push({
          label:
            "    " +
            cur3.id +
            " " +
            //+ cur.name + " - " + cur2.name + " - "
            cur3.name,
          value: cur3.id,
          fullPath:
            label +
            " > " +
            label2 +
            " " +
            cur2.name +
            " > " +
            label3 +
            " " +
            cur3.name,
        });
        return acc3;
      }, acc2);

      // return acc2;
    }, acc);
  }, []);

  industriesOptions.unshift({
    label: "Select industry...",
    value: "",
    fullPath: "",
  });

  return industriesOptions;
}
