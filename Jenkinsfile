pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        PROJECT_NAME    = 'nivara'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from Git repository...'
                checkout scm
            }
        }

        stage('Lint & Static Analysis') {
            steps {
                echo 'Running linters for client and server...'
                // sh 'cd client && npm run lint'
                // sh 'cd server && flake8 .'
            }
        }

        stage('Test') {
            steps {
                echo 'Running unit and integration tests...'
                // sh 'cd server && pytest'
                // sh 'cd client && npm test'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker container images...'
                // sh 'docker-compose build'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'NIVARA pipeline executed successfully!'
        }
        failure {
            echo 'NIVARA pipeline failed. Check logs for details.'
        }
    }
}
