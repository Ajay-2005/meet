# Use Maven + JDK image
FROM maven:3.9.3-eclipse-temurin-20

# Set working directory inside container
WORKDIR /app

# Copy pom.xml first (for dependency caching)
COPY backend/pom.xml ./ 

# Download dependencies offline
RUN mvn dependency:go-offline

# Copy the backend source code
COPY backend/src ./src

# Package the Spring Boot app
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the app (replace with actual JAR name)
CMD ["java","-jar","target/demo-0.0.1-SNAPSHOT.jar"]
