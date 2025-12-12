pipeline {
    agent any

    tools {
        maven 'Maven3'
        jdk 'Java17'
        nodejs 'Node22'
    }

    environment {
        SPRING_DATA_MONGODB_URI = "mongodb://mongodbatlas:27017/greentech_db"
        REACT_APP_API_BASE_URL = "https://localhost:8080/api"
    }

    stages {

        /* -------------------------
         *  GLOBAL CHECKOUT
         * ------------------------- */
        stage('Checkout Code') {
            steps {
                checkout scm
                echo 'Source code checked out.'
            }
        }

        /* -------------------------
         *  BACKEND (Spring Boot)
         * ------------------------- */
        stage('Backend - Build') {
            steps {
                dir('GreenTech-V2') {
                    echo 'Building Spring Boot backend...'
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Backend - Test') {
            steps {
                dir('GreenTech-V2') {
                    echo 'Running backend unit tests...'
                    sh 'mvn test'
                }
            }
        }

        /* -------------------------
         *  FRONTEND (React)
         * ------------------------- */
        stage('Frontend - Install Dependencies') {
            steps {
                dir('webProject_ReactWeb/greentech-dashboard-react') {
                    echo 'Installing React dependencies...'
                    sh 'npm install'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('webProject_ReactWeb/greentech-dashboard-react') {
                    echo 'Building React application...'
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend - Test') {
            steps {
                dir('webProject_ReactWeb/greentech-dashboard-react') {
                    echo 'Running React tests...'
                    sh 'npm test -- --watchAll=false'
                }
            }
        }

        stage('Frontend - Archive Artifacts') {
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
