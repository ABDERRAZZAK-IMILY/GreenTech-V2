pipeline {
    agent none

    environment {
        SPRING_DATA_MONGODB_URI = "mongodb+srv://admin:Axje10796%40@cluster0.6bacyth.mongodb.net/greentech_db"
        REACT_APP_API_BASE_URL = "https://greentech-api-p5dm.onrender.com/api"
    }

    stages {

        /* -------------------------
         *  CHECKOUT
         * ------------------------- */
        stage('Checkout Code') {
            agent any
            steps {
                checkout scm
                echo 'Source code checked out.'
            }
        }

        /* -------------------------
         *  BACKEND (Spring Boot)
         * ------------------------- */
        stage('Backend - Build') {
            agent {
                docker {
                    image 'maven:3.9.6-eclipse-temurin-17'
                    args '-v $HOME/.m2:/root/.m2'
                }
            }
            steps {
                dir('GreenTech-V2') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Backend - Test') {
            agent {
                docker {
                    image 'maven:3.9.6-eclipse-temurin-17'
                    args '-v $HOME/.m2:/root/.m2'
                }
            }
            steps {
                dir('GreenTech-V2') {
                    sh 'mvn test'
                }
            }
        }

        /* -------------------------
         *  FRONTEND (React) - Combined Stage
         * ------------------------- */
        stage('Frontend - Build & Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u $(id -u):$(id -g) -v $WORKSPACE:/workspace -w /workspace/webProject_ReactWeb/greentech-dashboard-react'
                }
            }
            steps {
                sh '''
                    echo "Installing dependencies..."
                    npm ci --legacy-peer-deps

                    echo "Building frontend..."
                    npm run build

                    echo "Running frontend tests..."
                    npm test -- --watchAll=false
                '''
            }
        }

        stage('Frontend - Archive Artifacts') {
            agent any
            steps {
                archiveArtifacts artifacts: 'webProject_ReactWeb/greentech-dashboard-react/build/**',
                        fingerprint: true
            }
        }
    }

    post {
        success {
            echo 'Backend and Frontend Build & Tests Succeeded!'
        }
        failure {
            echo 'Pipeline Failed!'
        }
    }
}
