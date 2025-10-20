pipeline {
    agent any

    // options {
    //     timeout(time: 15, unit: 'MINUTES')
    // }

    stages {

        stage('Select Environment') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'REMOTE_SERVER_TEST', variable: 'REMOTE_SERVER_TEST'),
                        string(credentialsId: 'REMOTE_SERVER_PROD', variable: 'REMOTE_SERVER_PROD')
                    ]) {
                        def branchName = env.GIT_BRANCH ?: sh(
                            script: "git rev-parse --abbrev-ref HEAD",
                            returnStdout: true
                        ).trim()

                        if (branchName.contains('develop')) {
                            env.REMOTE_SERVER = REMOTE_SERVER_TEST
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.osei-front-env'
                        } else if (branchName.contains('staging')) {
                            env.REMOTE_SERVER = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/secrets/staging/.osei-front-env'
                        } else if (branchName.contains('production')) {
                            env.REMOTE_SERVER = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.osei-front-env'
                        }
                    }
                }
            }
        }

        stage('Fetch Application Variables') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                        def secretsFile = env.SECRETS_PATH

                        env.REPO_URL = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep REPO_URL ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.BRANCH_NAME = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep BRANCH_NAME ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.REPO_DIR = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep REPO_DIR ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.DOCKERHUB_REPO = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep DOCKERHUB_REPO ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.SERVICE_NAME = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep SERVICE_NAME ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        // Fetch Vault credentials
                        env.VAULT_ADDR = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep VAULT_ADDR ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.VAULT_USERNAME = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep VAULT_USERNAME ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.VAULT_PASSWORD = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep VAULT_PASSWORD ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.VAULT_SECRET_PATH = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep VAULT_SECRET_PATH ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()
                    }
                }
            }
        }

        stage('Prepare Repository') {
            steps {
                withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            if [ -d "${env.REPO_DIR}" ]; then
                                sudo chown -R \$USER:\$USER ${env.REPO_DIR}
                                sudo chmod -R 755 ${env.REPO_DIR}
                            fi
                        '
                    """
                }
            }
        }

        stage('Pull Latest Changes') {
            steps {
                withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            if [ ! -d "${env.REPO_DIR}/.git" ]; then
                                git clone ${env.REPO_URL} -b ${env.BRANCH_NAME} ${env.REPO_DIR}
                            else
                                cd ${env.REPO_DIR} && git reset --hard HEAD && git pull origin ${env.BRANCH_NAME}
                            fi
                        '
                    """
                }
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'test-dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD'),
                    string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')
                ]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} << 'ENDSSH'
                            set -e

                            # Login to Docker Hub first
                            echo "Logging into Docker Hub..."
                            echo "${DOCKERHUB_PASSWORD}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin

                            if [ \$? -ne 0 ]; then
                                echo "ERROR: Docker login failed"
                                exit 1
                            fi

                            # Build the image
                            echo "Building Docker image..."
                            cd ${env.REPO_DIR}
                            docker build \
                                --build-arg VAULT_ADDR="${env.VAULT_ADDR}" \
                                --build-arg VAULT_USERNAME="${env.VAULT_USERNAME}" \
                                --build-arg VAULT_PASSWORD="${env.VAULT_PASSWORD}" \
                                --build-arg VAULT_SECRET_PATH="${env.VAULT_SECRET_PATH}" \
                                -t ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} .

                            if [ \$? -ne 0 ]; then
                                echo "ERROR: Docker build failed"
                                exit 1
                            fi

                            # Push the image
                            echo "Pushing Docker image..."
                            docker push ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME}

                            if [ \$? -ne 0 ]; then
                                echo "ERROR: Docker push failed"
                                exit 1
                            fi

                            # Clean up
                            echo "Cleaning up old images..."
                            docker image prune -f

                            echo "Build and push completed successfully"
ENDSSH
                    """
                }
            }
        }

       stage('Deploy Service') {
    steps {
        withCredentials([
            usernamePassword(credentialsId: 'test-dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD'),
            string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')
        ]) {
            script {
                sh """
                    sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} << 'ENDSSH'
                        set -e
                        echo '${DOCKERHUB_PASSWORD}' | docker login -u '${DOCKERHUB_USERNAME}' --password-stdin
                        if ! docker pull ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME}; then
                            exit 1
                        fi
                        cd ${env.REPO_DIR}
                        APP_PORT=\$(docker run --rm ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} printenv APP_PORT)
                        export DOCKERHUB_REPO=${env.DOCKERHUB_REPO}
                        export BRANCH_NAME=${env.BRANCH_NAME}
                        export APP_PORT=\$APP_PORT
                        if docker service inspect ${env.SERVICE_NAME} >/dev/null 2>&1; then
                            if ! docker service update \
                                --image ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} \
                                --with-registry-auth \
                                --publish-rm-all \
                                --publish-add published=\$APP_PORT,target=\$APP_PORT \
                                --force ${env.SERVICE_NAME}; then
                                exit 1
                            fi
                        else
                            if [ '${env.BRANCH_NAME}' = 'staging' ]; then
                                if ! APP_PORT=\$APP_PORT docker stack deploy --with-registry-auth -c stage-docker-compose.yml staging; then
                                    exit 1
                                fi
                            else
                                if ! APP_PORT=\$APP_PORT docker stack deploy --with-registry-auth -c docker-compose.yml pep; then
                                    exit 1
                                fi
                            fi
                        fi
ENDSSH
                """
            }
        }
    }
}


        stage('Verify Deployment') {
            steps {
                withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                    script {
                        sh """
                            sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} << 'ENDSSH'
                                echo "Verifying deployment status..."

                                for i in {1..20}; do
                                    STATUS=\$(docker service inspect --format "{{ if .UpdateStatus }}{{ .UpdateStatus.State }}{{ else }}none{{ end }}" ${env.SERVICE_NAME} 2>/dev/null)

                                    if [ -z "\$STATUS" ]; then
                                        STATUS="none"
                                    fi

                                    echo "Current update status: \$STATUS"

                                    if [ "\$STATUS" = "rollback_started" ] || [ "\$STATUS" = "rollback_completed" ] || [ "\$STATUS" = "rollback_paused" ]; then
                                        echo "Service is rolling back! Deployment failed."
                                        exit 1
                                    fi

                                    if [ "\$STATUS" = "completed" ] || [ "\$STATUS" = "none" ]; then
                                        echo "Service update completed successfully."
                                        break
                                    fi

                                    sleep 5
                                done
ENDSSH
                        """
                    }
                }
            }
        }

    }

    post {
        success {
            withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                sh """
                   sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} << 'ENDSSH'
                    if docker service inspect ${env.SERVICE_NAME} >/dev/null 2>&1; then
                        echo "Cleaning up stopped containers for service ${env.SERVICE_NAME}..."
                        docker ps -a \
                            --filter "label=com.docker.swarm.service.name=${env.SERVICE_NAME}" \
                            --filter "status=exited" -q | xargs -r docker rm -f
                    fi
ENDSSH
                """
            }
        }

        failure {
            echo 'Deployment failed.'
            emailext(
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                    <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    color: #333333;
                                    line-height: 1.6;
                                }
                                h2 {
                                    color: #e74c3c;
                                }
                                .details {
                                    margin-top: 20px;
                                }
                                .label {
                                    font-weight: bold;
                                }
                                .link {
                                    color: #3498db;
                                    text-decoration: none;
                                }
                                .footer {
                                    margin-top: 30px;
                                    font-size: 0.9em;
                                    color: #7f8c8d;
                                }
                            </style>
                        </head>
                        <body>
                            <h2>Build Failed</h2>
                            <p>The Jenkins job has failed. Please review the details below:</p>
                            <div class="details">
                                <p><span class="label">Job:</span> ${env.JOB_NAME}</p>
                                <p><span class="label">Build Number:</span> ${env.BUILD_NUMBER}</p>
                                <p><span class="label">Console Output:</span> <a href="${env.BUILD_URL}console" class="link">View the console output</a></p>
                            </div>
                        </body>
                    </html>
                """,
                from: 'selamnew@ienetworksolutions.com',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']],
                to: 'yonas.t@ienetworks.co'
            )
        }
    }
}
