# Natours Application

Built using modern technologies: node.js, express, mongoDB, mongoose and friends 😁

## Table of Contents

- [Installing](#installing)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Commands Cheat Sheet](#ongoing-task-list)
- [Ongoing Task List](#ongoing-task-list)

## Installing
Create NodeJs App and package.json file:
```bash
$ npm init --yes
```

Clone repository from GitHub:
```bash
git clone https://github.com/claudineisbezerra/natour.git
```

## Database
Local MongDB reference (Version 6.\*):
```js
mongodb://localhost:27017/natours
```

Remote MongDB reference using Atlas Service hosted by AWS (Version 6.\*):
```js
mongodb+srv://[user]:[Password]@[server pefix name].mongodb.net/natours?retryWrites=true
```

## Environment Variables
```js
#App Environment Variables
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://<USER>:<PASSWORD>@cluster0.gozquzy.mongodb.net/natours?retryWrites=true
DATABASE_LOCAL=mongodb://localhost:27017/natours
DATABASE_PASSWORD=<PASSWORD>
JWT_USER_ACCESS_SECRET=my-ultra-secure-and-ultra-long-secret
JWT_ACCESS_TOKEN_EXPIRES_IN=90d
JWT_REFRESH_TOKEN_EXPIRES_IN=90

#mailtrap for testing
EMAIL_USERNAME_MAILTRAP=<USER KEY>
EMAIL_PASSWORD_MAILTRAP=<PASSWORD KEY>
EMAIL_HOST_MAILTRAP=smtp.mailtrap.io
EMAIL_PORT_MAILTRAP=2525

#Email shadow for testing
EMAIL_FROM=myemail@mailsac.com

#sendgrid professional email service for testing
SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=<PASSWORD KEY >

#stripe professional payment for testing
STRIPE_PUBLIC_KEY=<STRIP_KEY>
STRIPE_SECRET_KEY=<STRIP_KEY>
STRIPE_WEBHOOK_SECRET=<STRIP_KEY>
```

## Deployment
Install and verify Heroku CLI
```bash
https://devcenter.heroku.com/articles/heroku-cli
heroku --version
```

Create App on Heroku
```bash
heroku login
heroku create
heroku logs --tail
heroku ps:scale web=0
heroku ps:scale web=1
heroku ps:scale web=2
heroku open
```

Install App on Heroku
```bash
git remote -v
# List/Verify remote repo connection

git push heroku master
```

## Commands Cheat Sheet
Git Commands
```bash
# Example of tagging github repo with Semantic Release

git remote -v
# List/Verify remote repo connection

git add .
git commit -m "Description of the change"
#Add and commit changes to local repo

git push -u origin master
#Save commited changes to remote repo

git tag
git tag -n
#Show created tags

git status
#Show pending changes to be commited

git log
#Show commits

git describe --tags
#Show current tag in use

git tag v1.1.3
git tag v1.1.4
#Create a new tag

git tag -a v1.1.8 -m "CICD deploy to Google Cloud Run"
#Create a new RELEASE tag (annotated tag)

git push origin <tagname>
git push origin master <tagname>
git push origin v1.1.8
#Send tag to remote repo

git push --tags
git push origin --tags
#Send all tags to remote repo
```

WSL commands
```bash
wsl -l -v
#Check wsl version

winget uninstall
winget uninstall --id "Ubuntu"

wsl --list
wsl --unregister "Ubuntu"
wsl --list --online
#Uninstall WSL Distro

wsl --shutdown
#Derruba o serviço wsl

systemctl status docker.service
sudo systemctl daemon-reload

sudo service docker start
sudo update-alternatives --config iptables
sudo service docker start
#Start docker daemon service

c:\Windows\System32\wsl.exe -d Ubuntu -u root /etc/init-wsl
#Iniciar o serviço de docker (docker Daemon) colocando os resultado no arquivo: /mnt/c/Users/Usuário/wsl_start.log

echo 1 | sudo tee /proc/sys/vm/drop_caches
#Liberar cache de memória

wsl --export "Ubuntu" C:\Users\Usuário\Desktop\backup.tar
wsl --import "Ubuntu" C:\Users\Usuário\Desktop\backup.tar
#Backup do ambiente WSL

explorer.exe .
#Chama comandos do windows

\\wsl$\Ubuntu\home\cb
#Acessar arquivos no WSL a partir do windows

zsh --version
sudo apt install zsh
#Installing Oh My Zsh
```

Docker GENERAL COMMANDS
```bash
docker system df
docker system df -v
#You can look up how much space is used by docker

docker system prune -f
docker system prune -af

docker image prune -f
docker image prune -af
#Clean up unused and dangling images

docker container prune -f
#Clean up stopped containers

docker volume prune -f
# Clean up unused volumes
# To clean up as much as possible excluding components that are in use.
# -a includes unused and dangling containers.
# -f force removing without asking confirmation.

docker stop <container_id/name> <container_id/name>
docker rm <container_id/name> <container_id/name>
# Manually remove containers

docker rmi <image_id/name> <image_id/name>
# Manually remove images locally

docker volume ls
docker volume rm <Volume Name> <Volume Name>
# Manually remove volumes

docker ps
#List all docker process (docker instances)

docker -d
#Start the docker daemon

docker --help
#Get help with Docker. Can also use –help on all subcommands

docker info
#Display system-wide information

docker history <image_name>:<label>
#Display system-wide information
```

Docker IMAGE commands
```bash
docker build -t <image_name>
docker build -t natours -f dockerfile.dev .
docker build -t <image_name> -f <dockerfile_name> .
#The docker build command builds an image called 'natours' from a Dockerfile.env

docker build -t <image_name> . –no-cache
docker build -t natours -f dockerfile.dev . –no-cache
docker build -t <image_name> -f <dockerfile_name> . <params>
#The docker build command builds an image called 'natours' from a Dockerfile.env without the cache

docker images
#List local images

docker image ls | grep natours
#List specific image named 'natours'

docker rmi <image_name>
docker rmi natours
#Delete an Image

docker image prune
#Remove all unused images

docker image ls | grep natours
docker rmi natours:latest
docker rmi node:16.16.0-slim
# Remove specific <image_name>:<label>
```

Docker HUB Commands
```bash
#Docker Hub is a service provided by Docker for finding and sharing
#container images with your team. Learn more and find images at https://hub.docker.com

docker ps -a
docker commit natours-full natours-full:latest
docker commit <container_name> <image_name>:<label>
#Create an Image from a Container to save in docker hub

# Step 1: Sign Up for Docker Hub
# Step 2: Sign In for Docker Hub
# Step 3: Create a Repository on Docker Hub
# Step 4: Push Image to Docker Hub

docker login -u <username>
# Login the Docker public registry from your local machine terminal

docker tag <local_image>:<label> <username>/<remote_image>:<label>
docker tag natours-full:1.1.0 claudineisbezerra/natours-full:1.1.0
# Tag the image

docker push <username>/<image_name>:<label>
docker push claudineisbezerra/natours-full:1.1.0
#Publish the image to Docker Hub

docker search <image_name>
docker search natours-full
#Search Hub for an image

docker pull <username>/<image_name>:<tag_name>
docker pull <image_name>:<tag_name>
docker pull node
docker pull claudineisbezerra/natours_image:latest
#To download a particular image, or set of images (i.e., a repository)
#Pull an image from a Docker Hub
#If no tag is provided, Docker Engine uses the :latest tag as a default.
```

Docker CONTAINER Commands
```bash
docker build -t <image_name>
docker build -t natours-full:1.1.0 -f dockerfile.dev .

docker scan natours-full:1.1.0
#Scan docker image for vulnerabillities using snyk
#Configure docker hub for scanning the image after image registration
#Integrate scanning in CI/CD process


snyk test --docker natours-full:1.1.0 --file=dockerfile.prod
# Scan the image for vulnerabilities with snyk

snyk monitor --docker natours-full:1.1.0
#Monitor a Docker image for known vulnerabilities. Snyk can notify and provide remediation advice.

docker build --target build-stage -t natours-full:1.1.0 -f dockerfile.prod .
docker build --target runtime-stage -t natours-full:1.1.0 -f dockerfile.prod .
#The docker build command builds an image called 'natours-full:1.1.0' from a dockerfile.prod using multi steps

docker build -t <image_name> -f <dockerfile_name> .
#The docker build command builds an image from a dockerfile

docker run --name <container_name> <image_name>:<label>
docker run -it --name <container_name> <image_name>:<label>
docker run -it --name natours-full natours-full:1.1.0
#Run a container from an existing image as interative console (-it)

docker run -P -d --name natours-full natours-full:1.1.0
#Run a container from an existing image and expose the ports defined in dockerfile as detached console (-d)

docker run -p 3000:3000 -d --name natours-full natours-full:1.1.0
#Run a container from an existing image and expose maps local port to container app port
#If image do not exists the command run will download the image

docker run \
-e "NODE_ENV=production" \
-u "node" \
-m "300M" --memory-swap "1G" \
-w "/home/node/app" \
-p "3000:3000" \
--name "natours-full" \
node server.js
# Docker Run: To run a default Node.js Docker Containerized application

sudo docker image inspect --format='' natours-full:1.1.0
#To inspect a image definition
#List all docker definition (in JSON FORMAT)

docker rename <container_name> <container_new_name>
#Rename a container

docker run -p <host_port>:<container_port> <image_name>
#Run a container with and publish a container’s port(s) to the host.

docker run -d <image_name>
#Run a container in the background

sudo docker run -it natours-full:1.1.0 bash
#See the coker image content

docker start|stop <container_name> (or <container_id>)
#Start or stop an existing container

docker rm <container_name>
#Remove a stopped container

docker exec -it <container_name> sh
docker exec -it <container_name> bash
docker exec -it natours bash
#Open a shell inside a running container

docker logs -f <container_name>
#Fetch and follow the logs of a container

docker inspect <container_name> (or <container_id>)
#To inspect a running container
#List all docker definition (in JSON FORMAT)

docker ps
docker ps -a | grep natours
#list currently running containers

docker rm <container_id/name> <container_id/name> <container_id/name>
docker rm natours
#Remove docker containers

docker ps --all
#List all docker containers (running and stopped):

docker container stats
#View resource usage stats
```

Docker Compose Commands
```bash

docker compose up
# levantar a versão default

docker compose -f docker-compose.dev.yaml up --build
docker compose -f docker-compose.dev.yaml up app db --build
docker compose --profile=develomment -f docker-compose.dev.yaml up --build
#Container creation, using partial containers or profile

STAGE=runtime-stage docker compose -f docker-compose.prod.yaml up --build
#Container creation, using runtime-stage defined to generate final version for production

docker compose -f docker-compose.prod.yaml up --build

docker compose -f docker-compose.dev.yaml exec -u root app bash
docker compose -f docker-compose.dev.yaml exec app bash
npm run start:dev
# Acessar o container diretamente via CLI commands

docker compose -f docker-compose.prod.yaml exec -u root app bash
docker compose -f docker-compose.prod.yaml exec app bash
npm run start:prod
# Versão de produção

whoami
# Exibe com qual usuário estou logado

chmod +x .docker/start.sh
#Permissão de execução no arquivo

rm -rf dist && npm run build && cd ./dist && find . -type d | sed -e "s/[^-][^\/]*\//  |/g" -e "s/|\([^ ]\)/| - \1/"
find | sed 's|[^/]*/|- |g'
# Clean, Compile and List directory as a tree
# List all files as a tree

docker compose -f docker-compose.dev.yaml ps
docker compose -f docker-compose.dev.yaml stop
docker compose -f docker-compose.dev.yaml start
docker compose -f docker-compose.dev.yaml down
#Destruir o ambiente docker

docker compose -f docker-compose.dev.yaml up -d
#Subir o ambiente docker com terminal detachado

docker compose -f docker-compose.dev.yaml up --build
#Subir o ambiente compilando a aplicação

docker compose -f docker-compose.dev.yaml up -d --build
#Subir o ambiente com terminal detachado compilando a aplicação

docker compose -f docker-compose.dev.yaml --profile development up --build
#Cria o ambiente baseado em profile

docker compose -f docker-compose.dev.yaml exec app bash
npm run start:dev

#Executa somente o estágio de testing definido em dockerfile.prod
STAGE=testing docker compose -f docker-compose.prod.yaml up
STAGE=production docker compose -f docker-compose.prod.yaml up

docker compose -f docker-compose.prod.yaml down
docker compose -f docker-compose.prod.yaml up
docker compose -f docker-compose.prod.yaml up --build

docker compose -f docker-compose.prod.yaml exec app_prod bash
npm run start:prod
```

## Ongoing Task List
- [x] 23/08/2022: Start using express.raw()
- [x] 24/08/2022: Implement restriction that users can only review (Create/Update/Delete) a tour that they have actually booked
- [x] 24/08/2022: Implement nested booking routes: /tours/:id/bookings and /users/:id/bookings;
- [x] 29/08/2022: Improve tour dates: add a participants and a soldOut field to each date.
      - A date then becomes like an instance of the tour.
      - Then, when a user books, they need to select one of the dates.
      - A new booking will increase the number of participants in the date, until it is booked out (participants > maxGroupSize).
      - So, when a user wants to book, you need to check if tour on the selected date is still available
- [x] Implement advanced authentication features
      - 30/08/2022: confirm user email
      - 06/09/2022: keep users logged in with refresh tokens
      - 09/09/2022: two-factor authentication
- [x] 09/09/2022: Implement a sign up form, similar to the login form
- [x] 09/09/2022: Create verification endpoint to activate account
- [x] 17/09/2022: On the tour detail page, if a user has taken a tour, allow them add a review directly on the website
      - 17/09/2022: On the tour detail page, allow user to book for only not booked dates
      - 17/09/2022: On the tour detail page, allow user to review already booked tours and update existing reviews
      - 12/09/2022: Show new Tour date format. Show only the tour dates booked by the user
- [x] Hide the entire booking section on the tour detail page if current user has already booked the tour
      - 17/09/2022: Prevent duplicate bookings on the model
      - 17/09/2022: Booked tour been presented by date.
- [x] 20/09/2022: Implement “like tour” functionality, with favourite tour page;
- [x] On the user account page, implement the “My Reviews” page, where all reviews are displayed, and a user can edit them
      - 17/09/2022: Implemented using PUG templates
      - 13/12/2022: Generated release 1.0.0 of the application in github
- [x] 13/12/2022: Start using docker for the app. Setup remote debugging support
      - Added dockerfile.dev and docker-compose.dev.yaml
- [x] 13/12/2022: Start using Semantic Release
      - Generated release 1.1.0 of the application in github
- [x] Automate deployment for the app
      - 14/12/2022: Manually create docker images and register to docker hub using docker CLI (claudineisbezerra/natours-full:1.1.0)
      - 14/12/2022: Added dockerfile.prod and docker-compose.prod.yaml
      - 15/12/2022: Manually create docker images and save it to docker hub using docker compose CLI
      - 16/12/2022: Automate docker image creation and register to docker hub using github actions
      - 22/12/2022: Install app at google CloudRun Service (Kubernetes Administrated Service)
      - 22/12/2022: New TAG VERSION delivered for testings
- [ ] For administrators, implement all the “Manage” pages, where they can CRUD (create, read, update, delete) tours, users, reviews, and bookings.
- [ ] Separate frontend and backend projects
      - If you know React ⚛ or Vue 🧡, this would be an amazing way to use the Natours API and train your skills!
- [ ] Add unit and system test to the app
