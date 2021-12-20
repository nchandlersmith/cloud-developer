'use strict'

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE

exports.handler = async (event) => {
  console.log('Processing event: ', event)

  // TODO: Read and parse "limit" and "nextKey" parameters from query parameters
  // let nextKey // Next key to continue scan operation if necessary
  // let limit // Maximum number of elements to return

  // HINT: You might find the following method useful to get an incoming parameter value
  // getQueryParameter(event, 'param')

  const nextKey = getQueryParameter(event, 'nextKey');
  const limit = getQueryParameter(event, 'limit')

  // TODO: Return 400 error if parameters are invalid
  if (nextKey === undefined) {
    return buildMissingParamResponse(nextKey)
  }

  if (limit === undefined) {
    return buildMissingParamResponse(limit)
  }

const result = await getDataFromDynamo(limit ,nextKey)

  // Return result
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items,
      // Encode the JSON object so a client can return it in a URL as is
      nextKey: encodeNextKey(result.LastEvaluatedKey)
    })
  }
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}

function buildMissingParamResponse(missingParam) {
  return {
    status: 400,
    body: JSON.stringify({message: `Request missing the following query param: ${missingParam}`})
  }
}


async function getDataFromDynamo(limit, nextKey) {
  // Scan operation parameters
  const scanParams = {
    TableName: groupsTable,
    // TODO: Set correct pagination parameters
    Limit: limit,
    ExclusiveStartKey: nextKey
  }
  console.log('Scan params: ', scanParams)

  const result = await docClient.scan(scanParams).promise()

  const items = result.Items

  console.log('Result: ', result)
  
  return items
}
