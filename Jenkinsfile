#!/usr/bin/env groovy
def app
pipeline {
  agent any
  //All parameters which will be used to run the pipeline.
  parameters {
		string(name: 'DOCKERHUB_URL', defaultValue: '', description: 'Dockerhub Url')
        string(name: 'DOCKERHUB_CREDETIAL_ID', defaultValue: '', description: 'Dockerhub CredentialId')
		string(name: 'GIT_CREDETIAL_ID', defaultValue: '', description: 'Dockerhub CredentialId')
		string(name: 'DOCKER_IMAGE_NAME', defaultValue: '', description: 'Docker Image Name')
		string(name: 'DOCKER_TAG', defaultValue: '', description: 'Docker Image Tag')
		string(name: 'GIT_URL', defaultValue: '', description: 'Git Url')
		string(name: 'SONARQUBE_URL', defaultValue: '', description: 'SonarQube Url')
		string(name: 'SONARQUBE_PROJECT_NAME', defaultValue: '', description: 'SonarQube Project Name')
		string(name: 'JFROG_CREDENTIAL_ID', defaultValue: '', description: 'JFrog repository CredentialId')
		string(name: 'JFROG_URL', defaultValue: '', description: 'JFrog repository URL')
		string(name: 'SLACK_API_URL', defaultValue: '', description: 'Slack API URL')
		string(name: 'SLACK_TOKEN', defaultValue: '', description: 'Slack token')
		string(name: 'SLACK_CHANNEL_NAME', defaultValue: '', description: 'Slack channel name')
		string(name: 'EMAIL_LIST', defaultValue: '', description: 'Email distribution list')
		string(name: 'CALLED_BY', defaultValue: '', description: 'Called by')
        string(name: 'URL', defaultValue: '',description: 'Callback URL')

		}
  stages {
	
	stage('ZICOS-Initialization'){
            when {
                expression { 
			return params.CALLED_BY != 'ZICOS';
		}
            }
            steps {
                sh "curl -X GET ${params.URL}/pipeline/execution?url=${JENKINS_URL}&jobName=${JOB_NAME}"
            }
        }

  stage('Build & push image') {
  
  steps { 
  script {
  
  try {
  if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Started: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}].")
			}
  checkout(	[$class                          : 'GitSCM',
				  branches                         : [[name: '*/master']],
				  doGenerateSubmoduleConfigurations: false,
				  extensions                       : [],
				  submoduleCfg                     : [],
				  userRemoteConfigs                : [[credentialsId: "${params.GIT_CREDETIAL_ID}",
				  url          					   : "${params.GIT_URL}"]]])
        app = docker.build("${params.DOCKER_IMAGE_NAME}:${params.DOCKER_TAG}")
		docker.withRegistry("${params.DOCKERHUB_URL}", "${params.DOCKERHUB_CREDETIAL_ID}") {
           // app.push("${env.BUILD_NUMBER}")//tag the image with the current build no.
            app.push("${params.DOCKER_TAG}") // tag the image with the param tag
			
			}
		} catch (e) {
			// If there was an exception thrown, the build failed.
			currentBuild.result = "FAILED"
			if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Failed: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}] Failed stage: [Build & push image]")
			}
			if (params.EMAIL_LIST?.trim())
			{
			notifyFailedBuild('Build & push image')
			}
			cleanup()
			throw e
			}
		}
		}
    }

			
		
 stage('Create Bridge') {
 
 steps { 
 script {
 try {
			sh """
			docker network create --driver bridge spadelite${env.BUILD_NUMBER}
			"""
			} catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Failed: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}] Failed stage: [Create Bridge]")
			}
			if (params.EMAIL_LIST?.trim())
			{
			notifyFailedBuild('Create Bridge')
			}
			cleanup()
			throw e
			}
			}
			}
		
		}	

			  
				
 stage('Checkout code'){
 
 steps { 
 script {
 try {
			 
			 checkout(	[$class                          : 'GitSCM',
				  branches                         : [[name: '*/master']],
				  doGenerateSubmoduleConfigurations: false,
				  extensions                       : [],
				  submoduleCfg                     : [],
				  userRemoteConfigs                : [[credentialsId: "${params.GIT_CREDETIAL_ID}",
				  url          					   : "${params.GIT_URL}"]]])
			 
			 } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Failed: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}] Failed stage: [Checkout code]")
			}
			if (params.EMAIL_LIST?.trim())
			{
			notifyFailedBuild('Checkout code')
			}
			cleanup()
			throw e
			}
			 }
			 }
			}
			 
			 
				
 stage('Build NPM'){

 
 steps { 
 script {
 try {
 docker.withRegistry("${params.DOCKERHUB_URL}", "${params.DOCKERHUB_CREDETIAL_ID}") {
             docker.image("${params.DOCKER_IMAGE_NAME}:${params.DOCKER_TAG}").inside("--net spadelite${env.BUILD_NUMBER} -u root -d --publish 6000:6000") 
			 {
 checkout(	[$class                          : 'GitSCM',
				  branches                         : [[name: '*/master']],
				  doGenerateSubmoduleConfigurations: false,
				  extensions                       : [],
				  submoduleCfg                     : [],
				  userRemoteConfigs                : [[credentialsId: "${params.GIT_CREDETIAL_ID}",
				  url          					   : "${params.GIT_URL}"]]])
			sh """
			
			npm install -g #Build the code using NPM
			
			npm install sonarqube-scanner --save-dev #install sonarqube-scanner
			 """ 
		}}	 } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Failed: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}] Failed stage: [Build NPM]")
			}
			if (params.EMAIL_LIST?.trim())
			{
			notifyFailedBuild('Build NPM')
			}
			cleanup()
			throw e
			}
			 }
			 }
			 
	}		 
			 
			 			 
 stage('Sonar Analysis'){
 
 
 steps { 
 script {
 try {
 docker.withRegistry("${params.DOCKERHUB_URL}", "${params.DOCKERHUB_CREDETIAL_ID}") {
             docker.image("${params.DOCKER_IMAGE_NAME}:${params.DOCKER_TAG}").inside("--net spadelite${env.BUILD_NUMBER} -u root -d --publish 6000:6000") 
			 {
 checkout(	[$class                          : 'GitSCM',
				  branches                         : [[name: '*/master']],
				  doGenerateSubmoduleConfigurations: false,
				  extensions                       : [],
				  submoduleCfg                     : [],
				  userRemoteConfigs                : [[credentialsId: "${params.GIT_CREDETIAL_ID}",
				  url          					   : "${params.GIT_URL}"]]])
 
	 withSonarQubeEnv('sonarqube') {
			 sh """
			 
			 
			 #create the temporary .js file to execute the sonar scan.
			 cat > sonar-project.js <<- "EOF"
			 const sonarqubeScanner = require('sonarqube-scanner');
			 sonarqubeScanner({
			 serverUrl: "${params.SONARQUBE_URL}",// Sonar server url param
			 options : {
			'sonar.sources': '.',
			'sonar.projectName': "${params.SONARQUBE_PROJECT_NAME}", //Name of the project which will be created in the Sonar server
			}
			}, () => {});
			EOF
			
			node sonar-project.js //execute the sonar scan
			rm sonar-project.js   #remove the temporary file. 
			""" 
			 }
			  timeout(time: 1, unit: 'HOURS') {
                waitForQualityGate abortPipeline: true
              }
	}} } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Failed: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}] Failed stage: [Sonar Analysis]")
			}
			if (params.EMAIL_LIST?.trim())
			{
			notifyFailedBuild('Sonar Analysis')
			}
			cleanup()
			throw e
			}
	 }
			 }
			 }
			 
		stage('Unit testing using mocha'){
		
  steps { 
  script {
  try {
  
  docker.withRegistry("${params.DOCKERHUB_URL}", "${params.DOCKERHUB_CREDETIAL_ID}") {
             docker.image("${params.DOCKER_IMAGE_NAME}:${params.DOCKER_TAG}").inside("--net spadelite${env.BUILD_NUMBER} -u root -d --publish 6000:6000") 
			 {
  checkout(	[$class                          : 'GitSCM',
				  branches                         : [[name: '*/master']],
				  doGenerateSubmoduleConfigurations: false,
				  extensions                       : [],
				  submoduleCfg                     : [],
				  userRemoteConfigs                : [[credentialsId: "${params.GIT_CREDETIAL_ID}",
				  url          					   : "${params.GIT_URL}"]]])
			sh """
			 npm install supertest --save-dev
			 mocha tests/test.js --reporter spec 
			 
			 """ 
		}}	} catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Failed: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}] Failed stage: [Unit testing using mocha]")
			}
			if (params.EMAIL_LIST?.trim())
			{
			notifyFailedBuild('Unit testing using mocha')
			}
			cleanup()
			throw e
			}
			}
			 
			 }
		}	
						
			
			
					 
  stage('Push artifacts to Artifactory'){
  
  steps { 
  script {
  try {
  docker.withRegistry("${params.DOCKERHUB_URL}", "${params.DOCKERHUB_CREDETIAL_ID}") {
             docker.image("${params.DOCKER_IMAGE_NAME}:${params.DOCKER_TAG}").inside("--net spadelite${env.BUILD_NUMBER} -u root -d --publish 6000:6000") 
			 {
  checkout(	[$class                          : 'GitSCM',
				  branches                         : [[name: '*/master']],
				  doGenerateSubmoduleConfigurations: false,
				  extensions                       : [],
				  submoduleCfg                     : [],
				  userRemoteConfigs                : [[credentialsId: "${params.GIT_CREDETIAL_ID}",
				  url          					   : "${params.GIT_URL}"]]])
			sh """
			touch ${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz
			tar --exclude='./node_modules' --exclude='./.scannerwork' --exclude='./.git' --exclude='./.gitignore' --exclude=${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz -zcvf ${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz .
			"""
			withCredentials([usernamePassword(credentialsId: "${params.JFROG_CREDENTIAL_ID}", usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
				 sh """
				 curl -u "${USERNAME}":"${PASSWORD}" -X PUT "${params.JFROG_URL}" -T "./${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz"
				 """
				}
			if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Success: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}]")
			}
			if (params.EMAIL_LIST?.trim())
			{
			notifySuccessBuild()
			}
		} }	} catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			if(params.SLACK_API_URL?.trim() && params.SLACK_TOKEN?.trim() && params.SLACK_CHANNEL_NAME?.trim())
			{
			notifySlack(params.SLACK_API_URL,params.SLACK_CHANNEL_NAME,params.SLACK_TOKEN,"Build Failed: Job ${env.JOB_NAME} [${env.BUILD_NUMBER}] Failed stage: [Push artifacts to Artifactory]")
			}
			if (params.EMAIL_LIST?.trim())
			{
			notifyFailedBuild('Push artifacts to Artifactory')
			}
			cleanup()
			throw e
			}
			}

			} 
			post { 
        always { 
		    cleanup()  //perform clean up
            cleanWs() //cleanup workspace
        }
}
        }
		
		
    }
    }
	def notifySlack(String slackUrl,String slackChannel,String slackToken,String message) {
		sh """
		curl -X POST -H 'Authorization: Bearer ${slackToken}' \
		-H 'Content-type: application/json' \
		--data '{"username":"ZICOS","channel":"${slackChannel}","text": "${message}"}' \
		${slackUrl}
		"""
		}
// function to handle the failed build notification.
		def notifyFailedBuild(String stage) {
		
		emailext(
		  to: "${params.EMAIL_LIST}",
		  subject: "Build Failed: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
		  body: "This email is to notify that Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' has been failed. Failed stage: [${stage}]"
		)
		}
		
// function to handle successful build notification.
		def notifySuccessBuild() {
		
		emailext(
		  to: "${params.EMAIL_LIST}",
		  subject: "Build Success: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
		  body: "This email is to notify that Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' has been completed successfully"
		)
		}

//function to clean docker container, volumes and network		
		def cleanup() {
		cleanWs() //cleanup workspace
		sh """
		docker ps -q -f status=exited | xargs --no-run-if-empty docker rm
		docker images -q -f dangling=true | xargs --no-run-if-empty docker rmi
		docker volume ls -qf dangling=true | xargs -r docker volume rm
		docker network rm spadelite${env.BUILD_NUMBER}
		"""
		}
