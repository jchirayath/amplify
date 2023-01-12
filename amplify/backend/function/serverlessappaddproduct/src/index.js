/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_SERVERLESSAPP_GRAPHQLAPIIDOUTPUT
	API_SERVERLESSAPP_GRAPHQLAPIENDPOINTOUTPUT
	API_SERVERLESSAPP_GRAPHQLAPIKEYOUTPUT
	USERSTABLE
Amplify Params - DO NOT EDIT */
const AWS = require("aws-sdk");
const SES = new AWS.SES({ region: "us-east-1" });

// const query = /* GraphQL */ `
//   query LIST_TODOS {
//     listTodos {
//       items {
//         id
//         name
//         description
//       }
//     }
//   }
// `;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);

    if(record.eventName === 'INSERT') {
      const receiverEmail = record.dynamodb.NewImage.email.S;

      const res = await SES.sendEmail({
        Source: "devsahan.info@gmail.com",
        Destination: {
          ToAddresses: [receiverEmail],
        },
        Message: {
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: `New product has been added to your account.`,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: `DemoApp - New Product Added`,
          },
        },
      }).promise();
      console.log("res", res);
    }
  }
  return { status: 'done' }
};