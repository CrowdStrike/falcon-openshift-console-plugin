FROM registry.access.redhat.com/ubi9/nginx-124:latest

COPY upstream.conf /opt/app-root/etc/nginx.d
COPY location.conf /opt/app-root/etc/nginx.default.d
USER 1001

ENTRYPOINT ["nginx", "-g", "daemon off;"]
