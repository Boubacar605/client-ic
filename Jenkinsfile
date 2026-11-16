pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'xeuysil/client'
        DOCKER_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }

    stages {
        stage('Récupération du code') {
            steps {
                checkout scm
            }
        }

        stage('Installation des dépendances') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Vérification du style') {
            steps {
                sh 'npx expo lint'
            }
        }

        stage('Export web') {
            steps {
                sh 'npx expo export --platform web'
            }
        }

        stage('Construction de l\'image Docker') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
            }
        }

        stage('Analyse de vulnérabilités (Trivy)') {
            steps {
                sh "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
            }
        }

        stage('Publication sur Docker Hub') {
            steps {
                sh '''
                    echo "${DOCKERHUB_CREDENTIALS_PSW}" | docker login -u "${DOCKERHUB_CREDENTIALS_USR}" --password-stdin
                    docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                    docker push ${DOCKER_IMAGE}:latest
                    docker logout
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline client terminé avec succès.'
        }
        failure {
            echo 'Échec du pipeline client.'
        }
    }
}
