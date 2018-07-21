/**
 * Remove double tick
 * @param {string} str String
 * @param {Object} options The options
 * @param {boolean} [options.isG=true] If is global / apply for all on the string (Default true)
 * @param {"whitespace"|"remove"|"sub"} [options.mode="whitespace"] The mode. Whitespace = add a \u200B, Remove = remove it,
 * sub = substitute with a single tick
 */
export default function no2Tick(
  str: string,
  { isG, mode }: { isG?: boolean, mode?: "whitespace" | "remove" | "sub" } = { isG: true, mode: "whitespace" }
) {
  return str.replace(
    isG ? /``/g : /``/,
    mode === "whitespace" ?
      "`\u200B`" :
        mode === "remove" ?
          "" :
          "`"
  );
}
