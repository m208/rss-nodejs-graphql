import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLSchema } from 'graphql';
import { graphqlBodySchema } from './schema';

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

      return await graphql({
        schema: schema,
        source: query!,
        contextValue: fastify.db,
        variableValues: variables
      });

    }
  );
};

export default plugin;
