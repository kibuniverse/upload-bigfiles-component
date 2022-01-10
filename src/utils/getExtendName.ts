export default function getExtendName(nameStr: string): string {
  return nameStr.split(".")[nameStr.split(".").length - 1];
}
