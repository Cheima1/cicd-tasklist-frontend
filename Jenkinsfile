pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        IMAGE_NAME = 'cheimasterclass/tasklist-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Docker') {
            steps {
                sh '''
                    if ! command -v docker &> /dev/null || ! docker version --format "{{.Client.Version}}" | grep -qE "^2[0-9]"; then
                        apt-get update -qq
                        apt-get install -y -qq docker.io
                    fi
                    docker --version
                '''
            }
        }

        stage('Install Trivy') {
            steps {
                sh '''
                    if ! command -v trivy &> /dev/null; then
                        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                    fi
                    trivy --version
                '''
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Unit tests') {
            steps {
                sh 'npm run test:coverage'
            }
        }

        stage('SonarQube analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        TASK_ID=$(grep -oP "(?<=ceTaskId=).*" .scannerwork/report-task.txt)
                        SONAR_URL=$(grep -oP "(?<=serverUrl=).*" .scannerwork/report-task.txt)

                        STATUS="PENDING"
                        for i in $(seq 1 30); do
                            RESPONSE=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_URL}/api/ce/task?id=${TASK_ID}")
                            STATUS=$(echo "$RESPONSE" | grep -oP "\\"status\\":\\"\\K[^\\"]+" | head -1)
                            echo "Task status: $STATUS"
                            if [ "$STATUS" = "SUCCESS" ] || [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELED" ]; then
                                break
                            fi
                            sleep 10
                        done

                        if [ "$STATUS" != "SUCCESS" ]; then
                            echo "SonarQube analysis task did not succeed: $STATUS"
                            exit 1
                        fi

                        ANALYSIS_ID=$(echo "$RESPONSE" | grep -oP "\\"analysisId\\":\\"\\K[^\\"]+")
                        QG_RESPONSE=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_URL}/api/qualitygates/project_status?analysisId=${ANALYSIS_ID}")
                        QG_STATUS=$(echo "$QG_RESPONSE" | grep -oP "\\"status\\":\\"\\K[^\\"]+" | head -1)
                        echo "Quality Gate status: $QG_STATUS"

                        if [ "$QG_STATUS" != "OK" ]; then
                            echo "Quality Gate failed: $QG_STATUS"
                            exit 1
                        fi
                    '''
                }
            }
        }

        stage('Build Docker image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Trivy scan') {
            steps {
                sh "trivy image --severity CRITICAL,HIGH --format table ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Generate SBOM') {
            steps {
                sh "trivy image --format spdx-json --output sbom-spdx.json ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "trivy image --format cyclonedx --output sbom-cyclonedx.json ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Push to DockerHub') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                    docker push "$IMAGE_NAME:$IMAGE_TAG"
                    docker push "$IMAGE_NAME:latest"
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'sbom-spdx.json,sbom-cyclonedx.json,reports/junit.xml', allowEmptyArchive: true
            junit 'reports/junit.xml'
        }
    }
}