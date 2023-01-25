import { DeviceType } from "aws-sdk/clients/ec2";
import { cloneDeep } from "lodash-es";

export function getObjectValue<T, K extends keyof T>(
  values: T,
  propertyName: K,
  deviceType: DeviceType
): typeof values[K] {
  const dPropertyName: K = ("text_D_" + deviceType) as K;
  const valuePerDevice: T[keyof T] | undefined = values[dPropertyName];

  return (
    valuePerDevice ? valuePerDevice : values[propertyName]
  ) as typeof values[K];
}

export function getObjectValues<T = { [key: string]: unknown }>(
  values: T,
  deviceType?: DeviceType
): T {
  if (!deviceType) return values;

  const retValues = cloneDeep(values);
  const retValuesKeyVal = retValues as unknown as {
    [key: string]: unknown;
  };

  Object.keys(retValuesKeyVal).forEach((val) => {
    const peaces: [string, string | undefined] = val.split("_D_") as [
      string,
      string | undefined
    ];

    if (peaces[1] === deviceType) {
      retValuesKeyVal[peaces[0]] = retValuesKeyVal[val];
    }
  });

  return retValues as unknown as T;
}
