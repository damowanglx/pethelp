export const WALKING_STATUS_LABELS: Record<string, string> = {
  open: '待匹配',
  matched: '已匹配',
  in_progress: '遛狗中',
  completed: '已完成',
  cancelled: '已取消',
};

export const MATCH_STATUS_LABELS: Record<string, string> = {
  applied: '已申请',
  accepted: '已接受',
  rejected: '已拒绝',
  cancelled: '已取消',
  in_progress: '进行中',
  completed: '已完成',
  disputed: '争议中',
};

export const URGENCY_COLORS: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FFC107',
  high: '#FF9800',
  emergency: '#F44336',
};

export const URGENCY_LABELS: Record<string, string> = {
  low: '低风险',
  medium: '注意观察',
  high: '建议就医',
  emergency: '立即就医',
};

export const SPECIES_LIST = ['金毛', '拉布拉多', '哈士奇', '德牧', '泰迪', '比熊',
  '柯基', '法斗', '博美', '吉娃娃', '萨摩耶', '阿拉斯加', '边牧', '柴犬', '英短', '美短', '布偶', '暹罗'];

export const REVIEW_TAGS = ['准时', '细心', '狗狗很开心', '沟通顺畅', '专业', '有耐心', '救急', '下次还找'];
