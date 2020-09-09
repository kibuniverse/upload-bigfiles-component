"use strict";
exports.__esModule = true;
function getExtendName(nameStr) {
    return nameStr.split('.')[nameStr.split('.').length - 1];
}
exports["default"] = getExtendName;
