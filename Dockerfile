FROM registry.access.redhat.com/ubi9/nodejs-20-minimal:latest AS build
USER root
RUN npm install -g corepack

ADD . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install && yarn build

FROM registry.access.redhat.com/ubi9/nginx-124:latest

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
USER 1001

ENTRYPOINT ["nginx", "-g", "daemon off;"]
