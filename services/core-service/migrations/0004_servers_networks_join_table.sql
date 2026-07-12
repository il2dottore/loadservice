CREATE TABLE IF NOT EXISTS "networks_servers" (
  "network_id" integer NOT NULL,
  "server_id" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "networks_servers_network_id_server_id_pk" PRIMARY KEY("network_id","server_id"),
  CONSTRAINT "networks_servers_network_id_networks_id_fk" FOREIGN KEY ("network_id") REFERENCES "public"."networks"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "networks_servers_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action
);

INSERT INTO "networks_servers" ("network_id", "server_id")
SELECT "network_id", "id"
FROM "servers"
WHERE "network_id" IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE "servers" DROP COLUMN IF EXISTS "network_id";
