export const hexStringToArrayBuffer = (hexString) => {
  hexString = hexString.replace(/^0x/, "");
  if (hexString.length % 2 != 0) {
    // eslint-disable-next-line no-console
    console.log(
      "WARNING: expecting an even number of characters in the hexString"
    );
  }
  const bad = hexString.match(/[G-Z\s]/i);
  if (bad) {
    // eslint-disable-next-line no-console
    console.log("WARNING: found non-hex characters", bad);
  }
  const pairs = hexString.match(/[\dA-F]{2}/gi);
  const integers = pairs.map(function (s) {
    return parseInt(s, 16);
  });
  const array = new Uint8Array(integers);
  return array.buffer;
};
