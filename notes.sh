# Database migration commands
cd /home/il2dottore/Projects/DarkSocial/services/darksocial-service
rm -rf migrations
npx drizzle-kit drop
npx drizzle-kit push
npx drizzle-kit generate
npx drizzle-kit migrate

# Account Portainer: admin:admin

# Deleted package.json config
#"db:generate": "drizzle-kit generate",
#"db:migrate": "drizzle-kit migrate",
#"db:studio": "drizzle-kit studio"

