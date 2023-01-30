import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLSchema, validate, parse } from 'graphql';
import { graphqlBodySchema } from './schema';
import depthLimit = require('graphql-depth-limit');

import { Query } from './queries';
import { Mutation } from './mutations';


type VariableValues = { [variable: string]: string };

type TgraphqlBodySchema = {
  query: string | undefined;
  mutation: string;
  variables: VariableValues; 
}

const schema = new GraphQLSchema({
	query: Query,
	mutation: Mutation,
});


const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      
      // TODO: fix env problem !
      const { query, variables } = request.body as TgraphqlBodySchema;   
      
      const maxDepth = 6;
      const errors = validate(schema, parse(query!), [depthLimit(maxDepth)]);

      if (errors.length > 0) {
        throw fastify.httpErrors.badRequest('Query depth exceeded!');
      }

      return await graphql({
        schema: schema,
        source: query!,
        contextValue: fastify.db,
        // contextValue: {
        //   db: fastify.db,
        //   dataloaders: new WeakMap(),
        // },
        variableValues: variables
      });

    }
  );
};

export default plugin;
