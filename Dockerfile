FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
ARG EXPO_PUBLIC_API_URL_WEB=http://localhost:3000/api/v1
ARG EXPO_PUBLIC_ADMIN_ROUTE=backoffice-acces
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL_WEB=$EXPO_PUBLIC_API_URL_WEB
ENV EXPO_PUBLIC_ADMIN_ROUTE=$EXPO_PUBLIC_ADMIN_ROUTE

RUN npx expo export --platform web

FROM nginx:alpine

RUN addgroup -S xeuysil && adduser -S xeuysil -G xeuysil

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
