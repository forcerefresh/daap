import { DeviceType } from "aws-sdk/clients/ec2";
import { cloneDeep } from "lodash-es";

// export function getObjectValue<T, K extends keyof T>(
//   values: T,
//   propertyName: K,
//   deviceType: DeviceType
// ): typeof values[K] {
//   const dPropertyName: K = ("text_D_" + deviceType) as K;
//   const valuePerDevice: T[keyof T] | undefined = values[dPropertyName];

//   return (
//     valuePerDevice ? valuePerDevice : values[propertyName]
//   ) as typeof values[K];
// }
