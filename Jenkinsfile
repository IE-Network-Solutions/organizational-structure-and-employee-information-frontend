pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Select Environment') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'REMOTE_SERVER_TEST_LAB', variable: 'REMOTE_SERVER_TEST')]) {
                        def branchName = env.GIT_BRANCH ?: sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                        env.BRANCH_NAME = branchName

                        if (branchName.contains('yonas')) {
                            env.SSH_CREDENTIALS_ID_1 = 'testlab'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_TEST
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.osei-front-env'
                            env.FRONTEND_ENV_PATH = '/home/ubuntu/frontend-env'
                        }
                    }
                }
            }
        }

        stage('Fetch Environment Variables') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                        def secretsPath = env.SECRETS_PATH
                        env.REPO_URL = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep REPO_URL ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                        env.BRANCH_NAME = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep BRANCH_NAME ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                        env.REPO_DIR = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep REPO_DIR ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                        env.DOCKERHUB_REPO = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep DOCKERHUB_REPO ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                    }
                }
            }
        }

        stage('Prepare Repository') {
            steps {
                        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                            sh """
                                sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                                if [ -d "$REPO_DIR" ]; then
                                    sudo chown -R \$USER:\$USER $REPO_DIR
                                    sudo chmod -R 755 $REPO_DIR
                                fi'
                            """

                }
            }
        }

        stage('Pull Latest Changes') {
           steps {
                        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                            sh """
                                sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                                if [ ! -d "$REPO_DIR/.git" ]; then
                                    git clone $REPO_URL -b $BRANCH_NAME $REPO_DIR
                                else
                                    cd $REPO_DIR && git reset --hard HEAD && git pull origin $BRANCH_NAME
                                fi'
                            """

                }
            }
        }

        stage('Copy env') {
             steps {
                        script {
                            def envPath = env.FRONTEND_ENV_PATH
                            withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                                sh """
                                    sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'cp ${envPath}/.osei-front-env ~/$REPO_DIR/.env'
                                """

                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD'),
                    string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')
                ]) {
                    sh """
                        sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                            cd ${env.REPO_DIR} &&
                            docker build -t ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} . &&
                            echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin &&
                            docker push ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} &&
                            docker image prune -f
                        '
                    """
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD'),
                    string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')
                ]) {
                    sh """
                        sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                            echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin &&
                            docker stack deploy -c ~/docker-compose.yml pep
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Next.js application deployed successfully using Docker!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
