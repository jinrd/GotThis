FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace

COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle
COPY src ./src

RUN chmod +x gradlew && ./gradlew --no-daemon bootJar

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN groupadd --system app \
    && useradd --system --gid app --no-create-home app

COPY --from=build /workspace/build/libs/*.jar ./app.jar

USER app
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]