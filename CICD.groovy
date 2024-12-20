pipeline {
    agent any

    tools { nodejs "node" }

    environment {
        AWS_CREDENTIALS = credentials('AWS_CREDENTIALS') // Your AWS credentials
        ECR_REGISTRY = '043309327322.dkr.ecr.us-east-1.amazonaws.com' 
        EKS_CLUSTER = 'EKS-Cluster-CMM707'
        REGION = 'us-east-1'
    }

    stages {
        stage("Clone code from GitHub") {
            steps {
                script {
                    checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'GITHUB_CREDENTIALS', url: 'https://github.com/prasad1563/CMM707-CW.git']])
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    def services = ['patient-service', 'doctor-service', 'appointment-service', 'notification-service', 'auth-service', 'agg-service']
                    for (service in services) {
                        sh """
                            cd ${service} &&
                            docker build -t ${service} .
                        """
                    }
                }
            }
        }

        stage('Push Docker Images to ECR') {
            steps {
                script {
                    sh "aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                    def services = ['patientservice', 'doctors', 'appointment', 'notification', 'auth', 'aggregator']
                    for (service in services) {
                        sh "docker push ${ECR_REGISTRY}/${service}"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes (EKS)') {
            steps {
                script {
                    sh "aws eks update-kubeconfig --name ${EKS_CLUSTER} --region ${REGION}"
                    def services = ['service1', 'service2', 'service3', 'service4', 'service5', 'service6']
                    for (service in services) {
                        sh """
                            kubectl set image deployment/${service}-deployment ${service}=${ECR_REGISTRY}/${service} --record
                            kubectl rollout status deployment/${service}-deployment
                        """
                    }
                }
            }
        }

        stage('Run Integration Tests') {
            steps {
                sh 'npm run integration-tests' 
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/test-reports/*.xml', allowEmptyArchive: true
        }
        success {
            echo 'Deployment and tests successful!'
        }
        failure {
            echo 'Deployment or tests failed!'
        }
    }
}
