import type {
  BaseInformation,
  Heartbeat,
  ObjectType,
} from "@/generated/orion_common";

BigInt.prototype.toJSON = function () {
  return Number(this);
};

export function generateRandomString(length: number): string {
  const random = Math.random();
  let result = "";
  for (let i = 0; i < length; i++) {
    result += String.fromCharCode(Math.floor(random * 26) + 65);
  }
  return "Orion.Client" + result;
}

export function toReadableDateTime(milliSeconds: BigInt): string {
  if (milliSeconds == undefined) {
    return "";
  }
  let millis = Number(milliSeconds);

  return new Date(millis).toLocaleDateString();
}

export function toReadableDateTimeFromString(
  millisAsString: string | undefined
): string {
  if (millisAsString == undefined || millisAsString.length == 0) {
    return "";
  }
  let millis = Number.parseInt(millisAsString);

  return new Date(millis).toLocaleDateString();
}

export function getUniqueHeartbeatKey(hb: Heartbeat) {
  return (
    hb.appName.toLowerCase() +
    hb.appVersion.toLowerCase() +
    hb.hostAddress +
    hb.port
  );
}

export function newBaseInformation(
  version: number,
  objectType: ObjectType
): BaseInformation {
  return {
    id: { uuid: "" },
    name: "",
    description: "",
    createdBy: "",
    createdDate: 0n,
    version: version,
    active: false,
    obsolete: false,
    objectType: objectType,
  };
}
