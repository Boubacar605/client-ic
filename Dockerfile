# syntax=docker/dockerfile:1
# L'export web est effectue par le pipeline CI avant ce build.
# Ce Dockerfile se contente de servir le dossier dist/ via nginx.

FROM nginx:alpine

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Render utilise $PORT (10000), local utilise 3000 par defaut
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/ || exit 1

# envsubst remplace $PORT dans le template au demarrage, puis lance nginx
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
