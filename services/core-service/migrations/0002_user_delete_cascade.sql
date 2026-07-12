ALTER TABLE "users_roles" DROP CONSTRAINT IF EXISTS "users_roles_user_id_users_id_fk";
ALTER TABLE "users_roles"
  ADD CONSTRAINT "users_roles_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "users_plans" DROP CONSTRAINT IF EXISTS "users_plans_user_id_users_id_fk";
ALTER TABLE "users_plans"
  ADD CONSTRAINT "users_plans_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
