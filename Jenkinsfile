#!/usr/bin/env groovy

pipeline {
  agent any
  //All parameters which will be used to run the pipeline.
  //parameters {
	//	string(name: 'DOCKERHUB_URL', defaultValue: 'https://registry.hub.docker.com', description: 'Dockerhub Url')
   //     string(name: 'DOCKERHUB_CREDETIAL_ID', defaultValue: 'prince11itc', description: 'Dockerhub CredentialId')
	//	string(name: 'GIT_CREDETIAL_ID', defaultValue: 'pm11prince', description: 'Dockerhub CredentialId')
	//	string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'prince11itc/node-base-img', description: 'Docker Image Name')
	//	string(name: 'DOCKER_TAG', defaultValue: 'latest', description: 'Docker Image Tag')
	//	string(name: 'GIT_URL', defaultValue: 'https://github.com/pm11prince/node-app.git', description: 'Git Url')
	//	string(name: 'SONARQUBE_URL', defaultValue: 'http://ec2-54-156-240-215.compute-1.amazonaws.com:9000/', description: 'SonarQube Url')
	//	string(name: 'SONARQUBE_PROJECT_NAME', defaultValue: 'Node-Project', description: 'SonarQube Project Name')
	//	string(name: 'JFROG_USER_NAME', defaultValue: 'admin', description: 'JFrog repository user name')
	//	string(name: 'JFROG_PASSWORD', defaultValue: 'admin@123', description: 'JFrog repository password')
	//	string(name: 'JFROG_URL', defaultValue: 'http://ec2-34-238-216-133.compute-1.amazonaws.com:8081/artifactory/Test-Repo/', description: 'JFrog repository URL')
	//	}
  stages {
    stage('Collect the parameters') {
      steps { 
   script {
		
    def app
	
	try {
	
  stage('Build image') {
        app = docker.build("prince11itc/node-base-img:latest")
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
        
		docker.withRegistry("https://registry.hub.docker.com", "prince11itc") {
            app.push("${env.BUILD_NUMBER}")//tag the image with the current build no.
            app.push("latest") // tag the image with the param tag
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
			docker.withRegistry("https://registry.hub.docker.com", "prince11itc") {
             docker.image("prince11itc/node-base-img:latest").inside("--net spadelite${env.BUILD_NUMBER} -u root") 
			 {
			  try {
				
 stage('Checkout code'){
			 // checkout the code 
		checkout(	[$class                          : 'GitSCM',
				  branches                         : [[name: '*/master']],
				  doGenerateSubmoduleConfigurations: false,
				  extensions                       : [],
				  submoduleCfg                     : [],
				  userRemoteConfigs                : [[credentialsId: "pm11prince",
				  url          					   : "https://github.com/pm11prince/node-app.git"]]])
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
			 cd server
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
			 sh """
			 cd server
			 
			 #create the temporary .js file to execute the sonar scan.
			 cat > sonar-project.js <<- "EOF"
			 const sonarqubeScanner = require('sonarqube-scanner');
			 sonarqubeScanner({
			 serverUrl: "http://ec2-54-156-240-215.compute-1.amazonaws.com:9000/",// Sonar server url param
			 options : {
			'sonar.sources': '.',
			'sonar.projectName': "Node-Project", //Name of the project which will be created in the Sonar server
			}
			}, () => {});
			EOF
			
			node sonar-project.js //execute the sonar scan
			rm sonar-project.js   #remove the temporary file. 
			""" 
			 }
			 
			 } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Sonar Analysis')
			cleanup()
			throw e
			}
			
			try {
			
  stage('Start the Node App'){
			 sh """
			  cd server
			 forever start server.js //start the app
			 """ 
			 }
			 } catch (e) {
			// If there was an exception thrown, the build failed
			currentBuild.result = "FAILED"
			notifyFailedBuild('Start the Node App')
			cleanup()
			throw e
			}
			try {		 
  stage('Push artifacts to Artifactory'){
			sh """
			touch ${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz
			tar --exclude='./server/node_modules' --exclude='./server/.scannerwork' --exclude='./.git' --exclude='./.gitignore' --exclude=${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz -zcvf ${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz .
			curl -u "admin":"admin@123" -X PUT "http://ec2-34-238-216-133.compute-1.amazonaws.com:8081/artifactory/Test-Repo/" -T "./${env.JOB_NAME}${env.BUILD_NUMBER}.tar.gz"

				""" 
			 
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
		  to: emailextrecipients([[$class: 'DevelopersRecipientProvider'],[$class: 'CulpritsRecipientProvider'],[$class: 'RequesterRecipientProvider']]),,
		  subject: "Build Failed: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
		  body: "This email is to notify that Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' has been failed. Failed stage: [${stage}]"
		)
		}
		
// function to handle successful build notification.
		def notifySuccessBuild() {
		
		emailext(
		  to: emailextrecipients([[$class: 'DevelopersRecipientProvider'],[$class: 'CulpritsRecipientProvider'],[$class: 'RequesterRecipientProvider']]),,
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