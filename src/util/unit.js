define({
  /**
   * Parses the angle string to radians
   * https://developer.mozilla.org/en-US/docs/CSS/angle
   *
   * @param {number|string} angle The angle/unit string
   * @returns {number} The angle in radians
   */
  parseAngle: function(angle) {
    if (typeof angle === 'number') return angle;

    var radians;
    var amount = parseFloat(angle), unit = angle.slice(angle.search(/[^\d.-]/));

    if (unit === 'deg') radians = amount / 180 * Math.PI;
    else if (unit === 'turn') radians = amount * 2 * Math.PI;
    else if (unit === 'rad') radians = amount;
    else if (unit === 'grad') radians = amount / 200 * Math.PI;

    return radians;
  }
});
