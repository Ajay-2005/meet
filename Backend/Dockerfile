# Start from Eclipse Temurin 21 JDK
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy pom.xml and fetch dependencies
COPY Backend/pom.xml ./
RUN mvn dependency:go-offline

# Copy source code
COPY Backend/src ./src

# Build the project
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the JAR
CMD ["java","-jar","target/demo-0.0.1-SNAPSHOT.jar"]
