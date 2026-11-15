# syntax=docker/dockerfile:1
# L'export web est effectué par le pipeline CI avant ce build.
# Ce Dockerfile se contente de servir le dossier dist/ via nginx.

FROM nginx:alpine

RUN addgroup -S xeuysil && adduser -S xeuysil -G xeuysil

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
