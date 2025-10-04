import { Industry } from "../../hooks/useIndustry";

export function getIndustriesOptionFromThree(industries: Industry[]) {
  const industriesOptions = industries.reduce<
    {
      label: string;
      value: string;
    }[]
  >((acc, cur, idx) => {
    acc.push({ label: idx + 1 + ". " + cur.name, value: cur.id });

    return cur.children.reduce((acc2, cur2, idx2) => {
      acc2.push({
        label:
          "  " +
          (idx + 1) +
          "." +
          (idx2 + 1) +
          ". " +
          // cur.name +
          // " - " +
          cur2.name,
        value: cur2.id,
      });

      return cur2.children.reduce((acc3, cur3, idx3) => {
        acc2.push({
          label:
            "    " +
            (idx + 1) +
            "." +
            (idx2 + 1) +
            "." +
            (idx3 + 1) +
            ". " +
            //+ cur.name + " - " + cur2.name + " - "
            cur3.name,
          value: cur3.id,
        });
        return acc3;
      }, acc2);

      // return acc2;
    }, acc);
  }, []);

  industriesOptions.unshift({ label: "Select industry...", value: "" });

  return industriesOptions;
}
