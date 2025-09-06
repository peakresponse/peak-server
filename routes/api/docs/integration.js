const express = require('express');
const { StatusCodes } = require('http-status-codes');
const { apiReference } = require('@scalar/express-api-reference');
const z = require('zod');
const { createDocument } = require('zod-openapi');

const router = express.Router();

const title = 'Peak Response Integration API Reference';
const header = z.object({
  Accept: z.string().meta({
    description: 'Must be "application/json" for Integration partners.',
    example: 'application/json',
  }),
  Authorization: z.string().meta({
    description: 'Bearer token provided by Peak Response to the Integration partner.',
    example: 'Bearer 976318ba3756a68a902a5be7216481c465fa2fe6dd005b9321a460cf7fb7bcbe',
  }),
  'X-Agency-State-Id': z.string().meta({
    description: 'The GNIS State ID for the Agency.',
    example: '25',
  }),
  'X-Agency-State-Unique-Id': z.string().meta({
    description: 'The State Unique ID for the Agency.',
    example: '3110',
  }),
});

router.get('/openapi.json', (req, res) => {
  const document = createDocument({
    info: {
      title,
      version: '1.0.0',
      description: 'This document provides information about the Peak Response API for Integration partners.',
    },
    paths: {
      '/oauth/token': {
        post: {
          description: 'This endpoint is used by the Integration partner client in order to get an access token.',
          requestBody: {
            content: {
              'application/x-www-form-urlencoded': {
                schema: z.object({
                  client_id: z.string().meta({
                    description: 'Client ID provided by Peak Response to the Integration partner.',
                    example: 'WpUEW2aJPMyzNZo6ey1w',
                  }),
                  client_secret: z.string().meta({
                    description: 'Client secret provided by Peak Response to the Integration partner.',
                    example: 'sqlnOdjhzItOpq3OjSYH3a7Jl2JRlEw7Q9bxPXqD',
                  }),
                  grant_type: z.string().meta({
                    description: 'Must be "client_credentials" for Integration partners.',
                    example: 'client_credentials',
                  }),
                }),
              },
            },
          },
          responses: {
            [StatusCodes.OK]: {
              content: {
                'application/json': {
                  schema: z.object({
                    access_token: z.string().meta({
                      description: 'Access token to be used in the Authorization header for subsequent API calls.',
                      example: '976318ba3756a68a902a5be7216481c465fa2fe6dd005b9321a460cf7fb7bcbe',
                    }),
                    token_type: z.string().meta({
                      description: 'Type of access_token. Will always be "Bearer" for Integration clients.',
                      example: 'Bearer',
                    }),
                    expires_in: z.number().meta({
                      description:
                        'Number of seconds until the access token expires. The access_token can be cached and reused for this amount of time. After expiration, request a new access_token.',
                      example: 3599,
                    }),
                  }),
                },
              },
            },
          },
        },
      },
      '/api/reports': {
        get: {
          description: 'This endpoint returns a paginated list of Reports for a given Agency.',
          requestParams: {
            header,
            query: z.object({
              page: z.number().optional().meta({
                description: 'Page number, starting from 1. If not specified, defaults to 1. Up to 25 records per page are returned.',
                example: 1,
              }),
            }),
          },
          responses: {
            [StatusCodes.OK]: {
              headers: z.object({
                Link: z.string().meta({
                  description: 'Link to the next, prev, first, and last page of records, if available.',
                  example: '<https://peakresponse.net/api/reports?page=2>; rel="next"',
                }),
                'X-Total-Count': z.number().meta({
                  description: 'Total number of records in the database for the Agency.',
                  example: 100,
                }),
              }),
              content: {
                'application/json': {
                  schema: z.array(
                    z.object({
                      id: z.string().meta({
                        description: 'UUID of the report.',
                      }),
                      incidentNumber: z.string().meta({
                        description: 'Incident number for the report.',
                      }),
                      unit: z.string().meta({
                        description: 'Unit call sign or number for the report.',
                      }),
                      pin: z.string().nullable().meta({
                        description: 'Patient Identifier, i.e. triage tag number, if available.',
                      }),
                      patientName: z.string().nullable().meta({
                        description: 'Patient name for the report, if available.',
                      }),
                      patientAge: z.number().nullable().meta({
                        description: 'Patient age for the report, if available.',
                      }),
                      patientAgeUnits: z.string().nullable().meta({
                        description: 'Patient age units for the report, if available, as a NEMSIS 3.5 code.',
                      }),
                      patientGender: z.string().nullable().meta({
                        description: 'Patient gender for the report, if available, as a NEMSIS 3.5 code.',
                      }),
                      createdAt: z.iso.datetime().meta({
                        description: 'Date and time the report was created.',
                      }),
                      updatedAt: z.iso.datetime().meta({
                        description: 'Date and time the report was last updated.',
                      }),
                      deletedAt: z.iso.datetime().nullable().meta({
                        description: 'Date and time the report was deleted, if deleted.',
                        example: null,
                      }),
                    }),
                  ),
                },
              },
            },
          },
        },
      },
      '/api/reports/:id/export': {
        get: {
          description: 'This endpoint exports a NEMSIS XML document for a given Report.',
          requestParams: {
            header,
            path: z.object({
              id: z.string().meta({
                description: 'UUID of the report.',
              }),
            }),
          },
          responses: {
            [StatusCodes.MOVED_TEMPORARILY]: {
              headers: z.object({
                Location: z.string().meta({
                  description:
                    'Asset URL of the exported NEMSIS XML document. Requesting the Asset URL will then redirect to a time-limited signed URL for the document.',
                }),
              }),
            },
          },
        },
      },
    },
  });
  res.json(document);
});

router.use(
  '/',
  apiReference({
    // Put your OpenAPI url here:
    pageTitle: title,
    url: '/api/docs/integration/openapi.json',
  }),
);

module.exports = router;
