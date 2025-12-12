pipeline {
    agent any

    tools {
        maven 'Maven3'
        jdk 'Java17'
    }

    environment {
        SPRING_DATA_MONGODB_URI = "mongodb://mongodbatlas:27017/greentech_db"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Checking out source code...'
            }
        }

        stage('Build') {
            steps {
                dir('GreenTech-V2') {
                    echo 'Building the application...'
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Test') {
            steps {
                dir('GreenTech-V2') {
                    echo 'Running Unit Tests...'
                    sh 'mvn test'
                }
            }
        }
    }

    post {
        success {
            echo 'Build and Test Succeeded!'
        }
        failure {
            echo 'Build Failed :('
        }
    }
}