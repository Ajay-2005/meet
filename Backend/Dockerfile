# Use Maven + JDK image
FROM maven:3.9.3-eclipse-temurin-20

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies first (caching)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the source code
COPY src ./src

# Package the Spring Boot app
RUN mvn clean package -DskipTests

# Expose the port your app runs on
EXPOSE 8080

# Run the app
CMD ["java","-jar","target/demo-0.0.1-SNAPSHOT.jar"]
