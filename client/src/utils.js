import { ASSET_COLORS } from "./constants";

export function getAssetColor(symbol, symbols) {
  let index = symbols.findIndex((s) => s === symbol);
  if (index === -1) return "#000000";
  if (index > ASSET_COLORS.length - 1) {
    console.log("Note enough colors defined! Defaulting to black");
    return "#000000";
  } else return ASSET_COLORS[index];
}
