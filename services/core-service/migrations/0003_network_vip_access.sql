ALTER TABLE "networks" ADD COLUMN IF NOT EXISTS "vip_access" boolean DEFAULT false NOT NULL;

UPDATE "networks"
SET "vip_access" = true
WHERE "name" = 'Diamond Network';

DROP TABLE IF EXISTS "networks_features";
