const AWS = require('aws-sdk')
const axios = require('axios')

const serviceName = process.env.SERVICE_NAME
const testUrl = process.env.URL

exports.handler = async (event) => {
  let endTime
  let requestWasSuccessful

  const startTime = timeInMillis()

  try {
    await axios.get(testUrl)
    endTime = timeInMillis()
    requestWasSuccessful = 1
  } catch(error) {
    console.error(error)
    endTime = timeInMillis()
    requestWasSuccessful = 0
  }

  const elapsedTime = endTime - startTime
  try {
    await updateCloudWatch('Latency', elapsedTime)
    await updateCloudWatch('Successful', requestWasSuccessful)
  } catch (error) {
    console.error(error)
    return {
      status: 500
    }
  }
  return {
    status: 200,
    body: {
      message: 'Success',
      latency: `${elapsedTime} ms`,
      successful: `${requestWasSuccessful} count`  
    }
  }

}

function timeInMillis() {
  return new Date().getTime()
}

async function updateCloudWatch(metricName, value) {
  const metricNameToUnits = {
    Latency: 'Milliseconds',
    Successful: 'Count'
  }

  const unit = metricNameToUnits[metricName]

  await new AWS.CloudWatch().putMetricData({
    MetricData: [
      {
        MetricName: metricName, 
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: unit,
        Value: value
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise()
}


