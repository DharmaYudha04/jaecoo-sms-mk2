FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL=/api
ARG VITE_ENABLE_DEMO_AUTH=false
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ENABLE_DEMO_AUTH=${VITE_ENABLE_DEMO_AUTH}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
