import { colorList } from "../../data/colorList";
import random from "../../funcs/numbers/random";

const colors = {
  RCOLORS: [
    "ff5252", "FF4081", "E040FB", "7C4DFF", "536DFE", "448AFF", "40C4FF", "18FFFF", "64FFDA", "69F0AE", "B2FF59",
    "EEFF41", "FFFF00", "FFD740", "FFAB40", "FF6E40"
  ],
  RANDOM_COLOR: () => colors.RCOLORS[random(0, colors.RCOLORS.length)],
  ROLE_DEFAULT: "#000000",
  ROLE_DISPLAY_DEFAULT: "#9CAAB3",
  COLORS: colorList,
  BACKGROUND: "#36393e"
};

export default colors;
