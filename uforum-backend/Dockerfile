# ─── Stage 1: Build ─────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Runtime ────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# curl e netcat para healthcheck
RUN apk add --no-cache curl netcat-openbsd

RUN addgroup -S uforum && adduser -S uforum -G uforum

COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads && chown -R uforum:uforum /app

USER uforum

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
