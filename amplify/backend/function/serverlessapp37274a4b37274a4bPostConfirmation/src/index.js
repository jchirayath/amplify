/* Amplify Params - DO NOT EDIT
	API_SERVERLESSAPP_GRAPHQLAPIENDPOINTOUTPUT
	API_SERVERLESSAPP_GRAPHQLAPIIDOUTPUT
	API_SERVERLESSAPP_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */ /**
 * @fileoverview
 *
 * This CloudFormation Trigger creates a handler which awaits the other handlers
 * specified in the `MODULES` env var, located at `./${MODULE}`.
 */

/**
 * This async handler iterates over the given modules and awaits them.
 *
 * @see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html#nodejs-handler-async
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 *
 */

import { default as fetch, Request } from "node-fetch";
const GRAPHQL_ENDPOINT = process.env.API_SERVERLESSAPP_GRAPHQLAPIENDPOINTOUTPUT;
const GRAPHQL_API_KEY = process.env.API_SERVERLESSAPP_GRAPHQLAPIKEYOUTPUT;

const query = /* GraphQL */ `
  mutation CREATE_USERS($input: CreateUsersInput!) {
    createUsers(createUsersInput: $input) {
      id
      name
      email
    }
  }
`;

export const handler = async (event, context) => {
  if (event.request.userAttributes.sub) {
    console.log("Event Request", event.request);
    let variables;
    if (
      event.request.userAttributes["cognito:user_status"] ===
      "EXTERNAL_PROVIDER"
    ) {
      const identityDetails = JSON.parse(
        event.request.userAttributes?.identities
      )[0];
      console.log("Identity Details: ", identityDetails);
      variables = {
        input: {
          id: `${identityDetails?.providerName?.toLowerCase()}_${
            identityDetails?.userId
          }`,
          name: event.request.userAttributes.name,
          email: event.request.userAttributes.email,
        },
      };
    } else {
      variables = {
        input: {
          id: event.request.userAttributes.sub,
          name: event.request.userAttributes.name,
          email: event.request.userAttributes.email,
        },
      };
    }

    const options = {
      method: "POST",
      headers: {
        "x-api-key": GRAPHQL_API_KEY,
      },
      body: JSON.stringify({ query, variables }),
    };

    const request = new Request(GRAPHQL_ENDPOINT, options);

    let statusCode = 200;
    let body;
    let response;

    try {
      response = await fetch(request);
      body = await response.json();
      if (body.errors) statusCode = 400;
      console.log("Response", body);
    } catch (error) {
      statusCode = 400;
      body = {
        errors: [
          {
            status: response.status,
            message: error.message,
            stack: error.stack,
          },
        ],
      };
      console.log("Error", body);
    }
    context.done(null, event);
    return {
      statusCode,
      body: JSON.stringify(body),
    };
  } else {
    console.log("Auth Error: Could not save user on DynamoDB");
    context.done(null, event);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Auth Error: Could not save user to database",
      }),
    };
  }
};
