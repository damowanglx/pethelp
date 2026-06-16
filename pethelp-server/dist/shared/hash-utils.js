"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Normalize = sha256Normalize;
const crypto = require("crypto");
function sha256Normalize(text) {
    const normalized = text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
}
//# sourceMappingURL=hash-utils.js.map