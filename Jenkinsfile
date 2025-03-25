pipeline {
    agent any

    stages {
        stage('Select Environment') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'REMOTE_SERVER_TEST', variable: 'REMOTE_SERVER_TEST'),
                        string(credentialsId: 'REMOTE_SERVER_PROD', variable: 'REMOTE_SERVER_PROD'),
                    ]) {
                        def branchName = env.GIT_BRANCH ?: sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                        env.BRANCH_NAME = branchName

                        if (branchName.contains('develop')) {
                            env.SSH_CREDENTIALS_ID_1 = 'peptest'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_TEST
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.osei-front-env'
                            env.FRONTEND_ENV_PATH = '/home/ubuntu/frontend-env'
                        } else if (branchName.contains('production')) {
                            env.SSH_CREDENTIALS_ID_1 = 'pepproduction'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.osei-front-env'
                            env.FRONTEND_ENV_PATH = '/home/ubuntu/frontend-env'
                        } else if (branchName.contains('staging')) {
                            env.SSH_CREDENTIALS_ID_1 = 'pepproduction'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/secrets/staging/.osei-front-env'
                            env.FRONTEND_ENV_PATH = '/home/ubuntu/frontend-env/staging'
                        }
                    }
                }
            }
        }

    stage('Fetch Environment Variables') {
            steps {
                script {
                    sshagent([env.SSH_CREDENTIALS_ID]) {
                        
                                def secretsPath = env.SECRETS_PATH
                        env.REPO_URL = sh(
                            script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep REPO_URL ${secretsPath}  | cut -d= -f2 | tr -d \"\\r\"'",
                            returnStdout: true
                        ).trim()

                        env.BRANCH_NAME = sh(
                            script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep BRANCH_NAME ${secretsPath} | cut -d= -f2 | tr -d \"\\r\"'",
                            returnStdout: true
                        ).trim()

                        env.REPO_DIR = sh(
                            script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep REPO_DIR ${secretsPath}  | cut -d= -f2 | tr -d \"\\r\"'",
                            returnStdout: true
                        ).trim()
                    }
                }
            }
        }

        stage('Prepare Repository') {
            steps {
                sshagent([env.SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
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
                sshagent([env.SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                        if [ ! -d "$REPO_DIR/.git" ]; then
                            git clone $REPO_URL -b $BRANCH_NAME $REPO_DIR
                        else
                            cd $REPO_DIR && git reset --hard HEAD && git pull origin $BRANCH_NAME
                        fi'
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                                        script {
                    def envPath = env.FRONTEND_ENV_PATH
                                            
                sshagent([env.SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cp ${envPath}/.osei-front-env ~/$REPO_DIR/.env'
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cd ~/$REPO_DIR && npm install'
                    """
                }
            }
        }
        }

        stage('Format Repo') {
            steps {
                sshagent([env.SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cd ~/$REPO_DIR && npm run format'
                    """
                }
            }
        }

stage('Run Next.js App') {
    parallel {
        stage('Start App on Production or Develop Server') {
            when {
                expression { env.BRANCH_NAME == "'develop'" || env.BRANCH_NAME == "'production'" }
            }
            steps {
                sshagent([env.SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cd ~/$REPO_DIR && npm run build'
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cd ~/$REPO_DIR && sudo pm2 delete osei-front-app || true'
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cd ~/$REPO_DIR && sudo pm2 start ecosystem.config.js --env production'
                    """
                }
            }
        }

        stage('Start App on Staging Server') {
            when {
                expression { env.BRANCH_NAME == "'staging'" }
            }
            steps {
                sshagent([env.SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cd ~/$REPO_DIR && npm run build'
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cd ~/$REPO_DIR && sudo pm2 delete staging-osei-front-app || true'
                        ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'cd ~/$REPO_DIR && sudo pm2 start stage-ecosystem.config.js --env staging'
                    """
                }
            }
        }
    }
}

    }

    post {
        success {
            echo 'Nest.js application deployed successfully!'
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
                to: 'yonas.t@ienetworksolutions.com, surafel@ienetworks.co, abeselom.g@ienetworksolutions.com'
            )
        }
    }
}
