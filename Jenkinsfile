// CI pipeline: test -> build images -> push versioned images to Docker Hub.
// Needs a Jenkins "Username with password" credential with ID 'dockerhub-creds'
// (Docker Hub username + access token).
// shortcut: uses `bat`, so it only runs on a Windows Jenkins agent (the team laptop); switch to `sh` for a Linux agent.
pipeline {
    agent any

    environment {
        DOCKERHUB = credentials('dockerhub-creds')   // exposes DOCKERHUB_USR and DOCKERHUB_PSW
        TAG       = "v${env.BUILD_NUMBER}"
    }

    stages {
        stage('Backend Tests') {
            steps {
                // venv lives at the workspace root so it stays out of the ml-model Docker build context
                bat 'python -m venv .ci-venv'
                bat '.ci-venv\\Scripts\\python -m pip install -q -r ml-model\\requirements.txt'
                dir('ml-model') {
                    bat '..\\.ci-venv\\Scripts\\python train.py'
                    bat '..\\.ci-venv\\Scripts\\python -m pytest -v --junitxml=..\\test-results.xml'
                }
            }
            post { always { junit 'test-results.xml' } }
        }

        stage('Frontend Lint & Build') {
            steps {
                dir('frontend/ai_resume_screening') {
                    bat 'npm ci'
                    bat 'npm run lint'
                    bat 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker build -t %DOCKERHUB_USR%/resume-backend:%TAG% -t %DOCKERHUB_USR%/resume-backend:latest ml-model'
                bat 'docker build -t %DOCKERHUB_USR%/resume-frontend:%TAG% -t %DOCKERHUB_USR%/resume-frontend:latest frontend/ai_resume_screening'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                bat 'echo %DOCKERHUB_PSW%| docker login -u %DOCKERHUB_USR% --password-stdin'
                bat 'docker push %DOCKERHUB_USR%/resume-backend:%TAG%'
                bat 'docker push %DOCKERHUB_USR%/resume-backend:latest'
                bat 'docker push %DOCKERHUB_USR%/resume-frontend:%TAG%'
                bat 'docker push %DOCKERHUB_USR%/resume-frontend:latest'
            }
            post { always { bat 'docker logout' } }
        }
    }
}
