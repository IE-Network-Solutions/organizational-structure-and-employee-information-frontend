pipeline {
    agent any

    environment {
        REMOTE_SERVER = 'ubuntu@139.185.51.164'
        REPO_URL = 'https://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@github.com/IE-Network-Solutions/organizational-structure-and-employee-information-frontend.git'
        BRANCH_NAME = 'staging'
        REPO_DIR = 'staging/osei-front'
        SSH_CREDENTIALS_ID = 'pepproduction'


        ORG_AND_EMP_URL="https://staging-org-emp.selamnew.com/api/v1"
        NEXT_PUBLIC_OKR_AND_PLANNING_URL="https://staging-okr.selamnew.com/api/v1"
        OKR_URL="https://staging-okr.selamnew.com/api/v1"
        TENANT_MGMT_URL="https://staging-tenant.selamnew.com/api/v1"
        ORG_DEV_URL = "https://staging-org-dev.selamnew.com/api/v1"
        RECRUITMENT_URL="https://staging-recruitment.selamnew.com/api/v1"
        NEXT_PUBLIC_APPROVERS_URL="https://test-approval-backend.ienetworks.co/api/v1"
        PUBLIC_DOMAIN="https://selamnew.com"
        NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL="https://staging-time.selamnew.com/api/v1"
        NEXT_PUBLIC_TRAIN_AND_LEARNING_URL="https://staging-training.selamnew.com/api/v1"
        NEXT_PUBLIC_API_KEY="AIzaSyCm35qpERDyW_IqaAJxaCTq5bSsvSpA-bQ"
        NEXT_PUBLIC_AUTH_DOMIAN="pep-stagging.firebaseapp.com"
        NEXT_PUBLIC_PROJECT_ID="pep-stagging"
        NEXT_PUBLIC_STORAGE_BUCKET="pep-stagging.appspot.com"
        NEXT_PUBLIC_MESSAGE_SENDER_ID="82054419625"
        NEXT_PUBLIC_APP_ID="1:82054419625:web:54adde047b410efd9cc5b8"
    }

    stages {

         stage('Pull Latest Changes') {

            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER '

                        if [ ! -d "$REPO_DIR/.git" ]; then
                            git clone $REPO_URL -b $BRANCH_NAME $REPO_DIR
                        else
                            cd $REPO_DIR && git reset --hard HEAD && git pull origin $BRANCH_NAME

                        fi'
                    """
                }
            }
        }
        stage('Create .env File') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cat > ~/$REPO_DIR/.env <<EOF
                        ORG_AND_EMP_URL=${ORG_AND_EMP_URL}
                        TENANT_MGMT_URL=${TENANT_MGMT_URL}
                        ORG_DEV_URL=${ORG_DEV_URL}
                        NEXT_PUBLIC_TRAIN_AND_LEARNING_URL=${NEXT_PUBLIC_TRAIN_AND_LEARNING_URL}
                        NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL=${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}
                        NEXT_PUBLIC_OKR_AND_PLANNING_URL=${OKR_URL}
                        OKR_URL=${OKR_URL}
                        RECRUITMENT_URL=${RECRUITMENT_URL}
                        PUBLIC_DOMAIN=${PUBLIC_DOMAIN}
                        NEXT_PUBLIC_API_KEY=${NEXT_PUBLIC_API_KEY}
                        NEXT_PUBLIC_AUTH_DOMIAN=${NEXT_PUBLIC_AUTH_DOMIAN}
                        NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}
                        NEXT_PUBLIC_STORAGE_BUCKET=${NEXT_PUBLIC_STORAGE_BUCKET}
                        NEXT_PUBLIC_MESSAGE_SENDER_ID=${NEXT_PUBLIC_MESSAGE_SENDER_ID}
                        NEXT_PUBLIC_APP_ID=${NEXT_PUBLIC_APP_ID}
                        NEXT_PUBLIC_APPROVERS_URL=${NEXT_PUBLIC_APPROVERS_URL}
                        EOF'
                    """
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm install'
                    """
                }
            }
        }
        stage('Run Next.js App') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm run format'
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && pm2 delete staging-pep-app || true'
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm run build && PORT=3005 pm2 start npm --name "staging-pep-app" -- start'
                    """
                }
            }
        }
    }
        post {
        success {
            echo 'Nest js application deployed successfully!'
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
