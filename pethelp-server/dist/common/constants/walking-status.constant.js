"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalkRewardType = exports.MatchStatus = exports.WalkingRequestStatus = void 0;
var WalkingRequestStatus;
(function (WalkingRequestStatus) {
    WalkingRequestStatus["OPEN"] = "open";
    WalkingRequestStatus["MATCHED"] = "matched";
    WalkingRequestStatus["IN_PROGRESS"] = "in_progress";
    WalkingRequestStatus["COMPLETED"] = "completed";
    WalkingRequestStatus["CANCELLED"] = "cancelled";
})(WalkingRequestStatus || (exports.WalkingRequestStatus = WalkingRequestStatus = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["APPLIED"] = "applied";
    MatchStatus["ACCEPTED"] = "accepted";
    MatchStatus["REJECTED"] = "rejected";
    MatchStatus["CANCELLED"] = "cancelled";
    MatchStatus["IN_PROGRESS"] = "in_progress";
    MatchStatus["COMPLETED"] = "completed";
    MatchStatus["DISPUTED"] = "disputed";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
var WalkRewardType;
(function (WalkRewardType) {
    WalkRewardType["FREE"] = "free";
    WalkRewardType["POINTS"] = "points";
    WalkRewardType["CASH"] = "cash";
})(WalkRewardType || (exports.WalkRewardType = WalkRewardType = {}));
//# sourceMappingURL=walking-status.constant.js.map