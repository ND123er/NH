pipeline {
  agent {label 'slave1'}

  environment {
    BUILD="/home/BUILDS/${JOB_NAME}"
    WORKSPACE="/home/jenkins/workspace/${JOB_NAME}"
  }

  stages {

    stage('OWASP Dependency Check') {
      steps {
        dependencyCheck additionalArguments: '''
                          --scan ./
                          --format HTML
                          --format XML
                          --out ./reports
                          --failOnCVSS 7
        ''', odcInstallation: 'OWASP Dependency Check'

        dependencyCheckPublisher pattern: 'reports/dependency-check-report.xml', stopBuild: true, unstableNewCritical: 1, unstableNewHigh: 1, unstableTotalCritical: 1, unstableTotalHigh: 1
        publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: '', reportFiles: '/reports/dependency-check-report.html', reportName: 'HTML Report', reportTitles: '', useWrapperFileDirectly: true])
      }
    }
    
    stage ('Start Building image') {
      steps {
        script {
          sh 'bash ./build.bash ${BUILD} ${WORKSPACE}'
        }
      }
    }
  }
}