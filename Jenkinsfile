#!/usr/bin/env groovy

pipeline {
  agent any
  //All parameters which will be used to run the pipeline.
  parameters {
		string(name: 'DOCKERHUB_URL', defaultValue: 'https://registry.hub.docker.com', description: 'Dockerhub Url')
        string(name: 'DOCKERHUB_CREDETIAL_ID', defaultValue: 'prince11itc', description: 'Dockerhub CredentialId')
		string(name: 'GIT_CREDETIAL_ID', defaultValue: 'pm11prince', description: 'Dockerhub CredentialId')
		string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'prince11itc/node-base-img', description: 'Docker Image Name')
		string(name: 'DOCKER_TAG', defaultValue: 'latest', description: 'Docker Image Tag')
		string(name: 'GIT_URL', defaultValue: 'https://github.com/pm11prince/code-repo.git', description: 'Git Url')
		string(name: 'SONARQUBE_URL', defaultValue: 'http://ec2-54-156-240-215.compute-1.amazonaws.com:9000/', description: 'SonarQube Url')
		string(name: 'SONARQUBE_PROJECT_NAME', defaultValue: 'Node-Project', description: 'SonarQube Project Name')
		string(name: 'JFROG_USER_NAME', defaultValue: 'admin', description: 'JFrog repository user name')
		string(name: 'JFROG_PASSWORD', defaultValue: 'itc11jfrog', description: 'JFrog repository password')
		string(name: 'JFROG_URL', defaultValue: 'http://ec2-34-238-216-133.compute-1.amazonaws.com:8081/artifactory/Test-Repo/', description: 'JFrog repository URL')
		}
  stages {
    stage('Collect the parameters') {
      steps { 
   script {
		
    def app
	
	try {
	
  stage('Build image') {
        //app = docker.build("prince11itc/node-base-img:latest")
		app = docker.build("${params.DOCKER_IMAGE_NAME}:${params.DOCKER_TAG}")
    }
	} catch (e) {
			// If there was an exception thrown, the build failed.
			currentBuild.result = "FAILED"
			notifyFailedBuild('Build image')
			cleanup()
			throw e
			}
	
		try {
			
		//Push the image into Docker hub	
  stage('Push image') {
        
		docker.withRegistry("${params.DOCKERHUB_URL}", "${params.DOCKERHUB_CREDETIAL_ID}") {
            app.push("${env.BUILD_NUMBER}")//tag the image with the current build no.
            app.push("${params.DOCKER_TAG}") // tag the image with the param tag
			}
		}
		} catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Push image')
			cleanup()
			throw e
			}
			
		try {
 stage('Create Bridge') {
			sh """
			docker network create --driver bridge spadelite${env.BUILD_NUMBER}
			"""
			}
		} catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Create Bridge')
			cleanup()
			throw e
			}
			
//Pull the image from Docker hub.			
			docker.withRegistry("${params.DOCKERHUB_URL}", "${params.DOCKERHUB_CREDETIAL_ID}") {
             docker.image("${params.DOCKER_IMAGE_NAME}:${params.DOCKER_TAG}").inside("--net spadelite${env.BUILD_NUMBER} -u root -d --publish 6000:6000") 
			 {
			  try {
				
 stage('Checkout code'){
			 // checkout the code 
		checkout(	[$class                          : 'GitSCM',
				  branches                         : [[name: '*/master']],
				  doGenerateSubmoduleConfigurations: false,
				  extensions                       : [],
				  submoduleCfg                     : [],
				  userRemoteConfigs                : [[credentialsId: "${params.GIT_CREDETIAL_ID}",
				  url          					   : "${params.GIT_URL}"]]])
			 }
			} catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Checkout code')
			cleanup()
			throw e
			}
			 
			 try {
				
 stage('Build NPM'){
			 sh """
			
			npm install -g #Build the code using NPM
			
			npm install sonarqube-scanner --save-dev #install sonarqube-scanner
			 """ 
			 }
			 } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Build NPM')
			cleanup()
			throw e
			}
			 
			 try {
			 			 
 stage('Sonar Analysis'){
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
			 }
			 } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Sonar Analysis')
			cleanup()
			throw e
			}
			
						
			try {
			
  stage('Unit testing using mocha'){
			 sh """
			 npm install supertest --save-dev
			 mocha tests/test.js --reporter spec 
			 
			 """ 
			 }
			 } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Unit testing using mocha')
			cleanup()
			throw e
			}
			
			try {		 
  stage('Push artifacts to Artifactory'){
			sh """
			touch ${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz
			tar --exclude='./node_modules' --exclude='./.scannerwork' --exclude='./.git' --exclude='./.gitignore' --exclude=${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz -zcvf ${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz .
			"""
	  		withCredentials([usernamePassword(credentialsId: 'JFROG_PASSWORD', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
				 sh 'curl -u "${USERNAME}":"${PASSWORD}" -X PUT "${params.JFROG_URL}" -T "./${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz"'
				}
			notifySuccessBuild()
			 
			 }
			 
			 } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Push artifacts to Artifactory')
			cleanup()
			throw e
			} 
			
          }
         }
		}
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

// function to handle the failed build notification.
		def notifyFailedBuild(String stage) {
		
		emailext(
		  to: emailextrecipients([[$class: 'DevelopersRecipientProvider'],[$class: 'CulpritsRecipientProvider'],[$class: 'RequesterRecipientProvider']]),
		  subject: "Build Failed: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
		  body: "This email is to notify that Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' has been failed. Failed stage: [${stage}]"
		)
		}
		
// function to handle successful build notification.
		def notifySuccessBuild() {
		
		emailext(
		  to: emailextrecipients([[$class: 'DevelopersRecipientProvider'],[$class: 'CulpritsRecipientProvider'],[$class: 'RequesterRecipientProvider']]),
		  subject: "Build Success: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
		  body: "This email is to notify that Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' has been completed successfully"
		)
		}

//function to clean docker container, volumes and network		
		def cleanup() {
		sh """
		docker ps -q -f status=exited | xargs --no-run-if-empty docker rm
		docker images -q -f dangling=true | xargs --no-run-if-empty docker rmi
		docker volume ls -qf dangling=true | xargs -r docker volume rm
		docker network rm spadelite${env.BUILD_NUMBER}
		"""
		}
