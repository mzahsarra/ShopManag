# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copier uniquement pom.xml d'abord pour le cache des dépendances
COPY pom.xml .
RUN mvn dependency:go-offline

# Copier le reste et compiler
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/shop-app-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]