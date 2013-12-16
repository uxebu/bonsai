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

    var bits = angle.split(/(?=\D)/, 2);
    console.log(bits);

    var radians,
      unit = '',
      amount = parseFloat(angle);

    switch (unit) {
      case '': // default
      case 'rad':
        radians = amount; break;
      case 'deg':
        radians = amount * PI / 180; break;
      case 'grad':
        radians = amount * PI / 200; break;
      case 'turn':
        radians = amount * 2 * PI; break;
    }

    return radians;
  }
});
