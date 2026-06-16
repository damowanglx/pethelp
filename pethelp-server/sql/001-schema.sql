-- ============================================================
-- PetHelp Database Schema v2
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  openid        VARCHAR(64)    NOT NULL UNIQUE,
  unionid       VARCHAR(64)    DEFAULT NULL,
  nickname      VARCHAR(64)    DEFAULT NULL,
  avatar_url    VARCHAR(256)   DEFAULT NULL,
  phone         VARCHAR(20)    DEFAULT NULL,
  role          ENUM('pet_owner','helper','both') NOT NULL DEFAULT 'both',
  gender        TINYINT        DEFAULT 0 COMMENT '0:unknown 1:male 2:female',
  city          VARCHAR(64)    DEFAULT NULL,
  province      VARCHAR(64)    DEFAULT NULL,
  latitude      DECIMAL(10,7)  DEFAULT NULL,
  longitude     DECIMAL(10,7)  DEFAULT NULL,
  location_updated_at DATETIME DEFAULT NULL,
  -- Trust & credit fields
  credit_score        DECIMAL(5,2) UNSIGNED NOT NULL DEFAULT 0.00,
  completion_count    INT UNSIGNED NOT NULL DEFAULT 0,
  cancellation_count  INT UNSIGNED NOT NULL DEFAULT 0,
  completion_rate     DECIMAL(5,4) UNSIGNED NOT NULL DEFAULT 0.0000,
  avg_response_time_s INT UNSIGNED DEFAULT NULL,
  is_helper           TINYINT(1) NOT NULL DEFAULT 0,
  has_deposit         TINYINT(1) NOT NULL DEFAULT 0,
  completed_walks     INT UNSIGNED NOT NULL DEFAULT 0,
  rating_avg          DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  is_disabled         TINYINT(1) NOT NULL DEFAULT 0,
  last_login_at       DATETIME DEFAULT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_location (latitude, longitude),
  INDEX idx_users_credit (credit_score DESC),
  INDEX idx_users_helper (is_helper),
  INDEX idx_users_completion (completion_rate DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: pets
-- ============================================================
CREATE TABLE IF NOT EXISTS pets (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(32)    NOT NULL,
  species       ENUM('dog','cat','other') NOT NULL DEFAULT 'dog',
  breed         VARCHAR(64)    NOT NULL,
  avatar_url    VARCHAR(256)   DEFAULT NULL,
  birth_date    DATE           DEFAULT NULL,
  weight_kg     DECIMAL(5,2)   DEFAULT NULL,
  gender        ENUM('male','female','unknown') NOT NULL DEFAULT 'unknown',
  is_neutered   TINYINT(1)     NOT NULL DEFAULT 0,
  temperament   VARCHAR(128)   DEFAULT NULL,
  medical_notes TEXT           DEFAULT NULL,
  walk_duration_min INT UNSIGNED DEFAULT 30,
  is_disabled   TINYINT(1)     NOT NULL DEFAULT 0,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pets_user (user_id),
  INDEX idx_pets_species (species)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: walking_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS walking_requests (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id          BIGINT UNSIGNED NOT NULL,
  pet_id            BIGINT UNSIGNED NOT NULL,
  status            ENUM('open','matched','in_progress','completed','cancelled')
                      NOT NULL DEFAULT 'open',
  walk_date         DATE           NOT NULL,
  start_time        TIME           NOT NULL,
  end_time          TIME           NOT NULL,
  duration_minutes  INT UNSIGNED   NOT NULL,
  address           VARCHAR(256)   NOT NULL,
  latitude          DECIMAL(10,7)  NOT NULL,
  longitude         DECIMAL(10,7)  NOT NULL,
  reward_type       ENUM('free','points','cash') NOT NULL DEFAULT 'free',
  reward_amount     DECIMAL(10,2)  DEFAULT 0.00,
  description       TEXT           DEFAULT NULL,
  require_experience TINYINT(1)    NOT NULL DEFAULT 0,
  apply_count       INT UNSIGNED   NOT NULL DEFAULT 0,
  matched_helper_id BIGINT UNSIGNED DEFAULT NULL,
  completed_at      DATETIME       DEFAULT NULL,
  cancelled_at      DATETIME       DEFAULT NULL,
  cancel_reason     VARCHAR(256)   DEFAULT NULL,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_helper_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_walking_status (status),
  INDEX idx_walking_date (walk_date),
  INDEX idx_walking_owner (owner_id),
  INDEX idx_walking_location (latitude, longitude),
  INDEX idx_walking_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: matches
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_id        BIGINT UNSIGNED NOT NULL,
  helper_id         BIGINT UNSIGNED NOT NULL,
  status            ENUM('applied','accepted','rejected','cancelled','in_progress','completed','disputed')
                      NOT NULL DEFAULT 'applied',
  owner_message     VARCHAR(512)   DEFAULT NULL,
  helper_message    VARCHAR(512)   DEFAULT NULL,
  responded_at      DATETIME       DEFAULT NULL,
  started_at        DATETIME(3)    DEFAULT NULL,
  ended_at          DATETIME(3)    DEFAULT NULL,
  track_distance_m  INT UNSIGNED   DEFAULT NULL,
  track_duration_s  INT UNSIGNED   DEFAULT NULL,
  sync_interval_s   TINYINT UNSIGNED DEFAULT 5,
  completed_at      DATETIME       DEFAULT NULL,
  cancelled_at      DATETIME       DEFAULT NULL,
  cancel_reason     VARCHAR(256)   DEFAULT NULL,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES walking_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (helper_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_match_request_helper (request_id, helper_id),
  INDEX idx_match_helper (helper_id),
  INDEX idx_match_status (status),
  INDEX idx_match_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: chat_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  match_id          BIGINT UNSIGNED NOT NULL,
  sender_id         BIGINT UNSIGNED NOT NULL,
  receiver_id       BIGINT UNSIGNED NOT NULL,
  msg_type          ENUM('text','image','location','system')
                      NOT NULL DEFAULT 'text',
  content           TEXT           NOT NULL,
  is_read           TINYINT(1)     NOT NULL DEFAULT 0,
  read_at           DATETIME       DEFAULT NULL,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chat_match (match_id, created_at),
  INDEX idx_chat_sender (sender_id, created_at DESC),
  INDEX idx_chat_unread (receiver_id, is_read, match_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: knowledge_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(64)    NOT NULL,
  icon              VARCHAR(128)   DEFAULT NULL,
  parent_id         BIGINT UNSIGNED DEFAULT NULL,
  sort_order        INT UNSIGNED   NOT NULL DEFAULT 0,
  is_active         TINYINT(1)     NOT NULL DEFAULT 1,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  INDEX idx_kc_parent (parent_id),
  INDEX idx_kc_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: knowledge_articles
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id       BIGINT UNSIGNED NOT NULL,
  title             VARCHAR(256)   NOT NULL,
  summary           VARCHAR(512)   DEFAULT NULL,
  cover_url         VARCHAR(256)   DEFAULT NULL,
  content           LONGTEXT       NOT NULL,
  tags              VARCHAR(256)   DEFAULT NULL,
  source_type       ENUM('curated','user','cms') NOT NULL DEFAULT 'curated',
  source_author     VARCHAR(64)    DEFAULT NULL,
  view_count        INT UNSIGNED   NOT NULL DEFAULT 0,
  like_count        INT UNSIGNED   NOT NULL DEFAULT 0,
  share_count       INT UNSIGNED   NOT NULL DEFAULT 0,
  is_published      TINYINT(1)     NOT NULL DEFAULT 0,
  published_at      DATETIME       DEFAULT NULL,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES knowledge_categories(id) ON DELETE CASCADE,
  INDEX idx_ka_category (category_id),
  INDEX idx_ka_published (is_published, published_at DESC),
  INDEX idx_ka_view (view_count DESC),
  FULLTEXT INDEX ft_ka_search (title, content) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: review_ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS review_ratings (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  match_id          BIGINT UNSIGNED NOT NULL UNIQUE,
  reviewer_id       BIGINT UNSIGNED NOT NULL,
  reviewee_id       BIGINT UNSIGNED NOT NULL,
  rating            TINYINT UNSIGNED NOT NULL COMMENT '1-5 stars',
  tags              JSON           DEFAULT NULL,
  from_role         ENUM('owner','helper') NOT NULL,
  comment           TEXT           DEFAULT NULL,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_review_reviewee (reviewee_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: walk_trails
-- ============================================================
CREATE TABLE IF NOT EXISTS walk_trails (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  match_id          BIGINT UNSIGNED NOT NULL,
  coordinates       JSON           NOT NULL COMMENT '[{lat, lng, timestamp}]',
  total_distance_m  INT UNSIGNED   NOT NULL DEFAULT 0,
  total_duration_s  INT UNSIGNED   NOT NULL DEFAULT 0,
  started_at        DATETIME(3)    NOT NULL,
  ended_at          DATETIME(3)    DEFAULT NULL,
  created_at        DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  INDEX idx_trail_match (match_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: walk_locations
-- ============================================================
CREATE TABLE IF NOT EXISTS walk_locations (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  match_id          BIGINT UNSIGNED NOT NULL,
  lat               DECIMAL(10,7)  NOT NULL,
  lng               DECIMAL(10,7)  NOT NULL,
  timestamp         DATETIME(3)    NOT NULL,
  created_at        DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  INDEX idx_wl_match_time (match_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: badge_definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS badge_definitions (
  badge_key         VARCHAR(50)    PRIMARY KEY,
  name              VARCHAR(100)   NOT NULL,
  icon              VARCHAR(255)   DEFAULT NULL,
  description       VARCHAR(500)   DEFAULT NULL,
  rule              JSON           NOT NULL COMMENT '{"type":"walks_count","operator":"gte","value":50}',
  category          VARCHAR(50)    NOT NULL DEFAULT 'general',
  sort_order        INT            NOT NULL DEFAULT 0,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: user_badges
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  badge_key         VARCHAR(50)    NOT NULL,
  awarded_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_key) REFERENCES badge_definitions(badge_key) ON DELETE CASCADE,
  UNIQUE KEY uk_user_badge (user_id, badge_key),
  INDEX idx_ub_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: user_certifications
-- ============================================================
CREATE TABLE IF NOT EXISTS user_certifications (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  cert_type           VARCHAR(50)    NOT NULL DEFAULT 'pet_experience',
  species_experience  JSON           DEFAULT NULL COMMENT '[{"species":"金毛","years":3,"count":1}]',
  years               TINYINT UNSIGNED NOT NULL DEFAULT 0,
  self_description    VARCHAR(2000)  DEFAULT NULL,
  proof_photos        JSON           DEFAULT NULL,
  status              ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_remark        VARCHAR(500)   DEFAULT NULL,
  verified_at         DATETIME       DEFAULT NULL,
  verified_by         BIGINT UNSIGNED DEFAULT NULL,
  created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_uc_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: user_deposits
-- ============================================================
CREATE TABLE IF NOT EXISTS user_deposits (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  amount_cents        INT UNSIGNED   NOT NULL DEFAULT 0,
  status              ENUM('held','released','refunded','forfeited') NOT NULL DEFAULT 'held',
  match_id            BIGINT UNSIGNED DEFAULT NULL,
  transaction_id      VARCHAR(100)   DEFAULT NULL,
  held_at             DATETIME       DEFAULT NULL,
  released_at         DATETIME       DEFAULT NULL,
  created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_deposit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: ai_consultations
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_consultations (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  pet_id              BIGINT UNSIGNED DEFAULT NULL,
  consultation_type   ENUM('symptom','follow_up') NOT NULL DEFAULT 'symptom',
  parent_id           BIGINT UNSIGNED DEFAULT NULL,
  query_text          VARCHAR(2000)  NOT NULL,
  response            JSON           NOT NULL,
  related_article_ids JSON           DEFAULT NULL,
  urgency_level       ENUM('low','medium','high','emergency') DEFAULT NULL,
  tokens_used         INT UNSIGNED   DEFAULT NULL,
  query_hash          VARCHAR(64)    DEFAULT NULL,
  created_at          DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES ai_consultations(id) ON DELETE SET NULL,
  INDEX idx_aic_user (user_id, created_at DESC),
  INDEX idx_aic_hash (query_hash),
  INDEX idx_aic_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: ai_daily_usage
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_daily_usage (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED NOT NULL,
  query_date          DATE           NOT NULL,
  count               INT UNSIGNED   NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_ai_usage (user_id, query_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
