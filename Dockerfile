# syntax=docker/dockerfile:1
# ==============================================================================
# VersIOT — Multi-Stage Production Build (Node 22 Builder + Nginx 1.27)
# ==============================================================================

# ESTÁGIO 1: Build da Aplicação Vite SPA
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ESTÁGIO 2: Servidor Web Nginx Otimizado
FROM nginx:1.27-alpine

# Remove configuração padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia configuração otimizada do Nginx (com cache e fallback SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefatos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
