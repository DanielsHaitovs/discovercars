# Project
Docker, Nestjs, Postgress powered by Prisma, Nextjs with shadcn

# Step By Step guide 

1. Create .env file
  # .env file content:
    API_PORT=

    DB_USER=""
    DB_PASSWORD=""
    DB_PORT=
    DB_NAME=""
    DB_HOST=postgres

    FE_PORT=
    EXTERNAL_API_URL="http://backend:${API_PORT}"

# Prepare Nestjs and Database
  # Docker
    # To start the project
    2-1. docker-composer up --build OR (docker-compose build && docker-compose up)

  # Prisma 
    Once DB is up and ready to accept the connections
    generates the Prisma Client based on your Prisma schema is done during build -> docker exec -it nestjs-backend npx prisma generate
    (in case using dev) docker exec -it nestjs-backend-dev npx prisma generate

    3-1. Run Migrations
      docker exec -it nestjs-backend npx prisma migrate deploy
      (in case using dev)
      docker exec -it nestjs-backend-dev npx prisma migrate deploy
  
      List migrations
        docker exec -it nestjs-backend npx prisma migrate status
  
    3-2. Import User Sample data
      docker exec -it nestjs-backend npm run prisma:seed
      (in case using dev)
      docker exec -it nestjs-backend-dev npm run prisma:seed
