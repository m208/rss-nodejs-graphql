import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList } from 'graphql';
import { graphqlBodySchema } from './schema';
import fetch from 'node-fetch';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    // subscribedToUserIds: { type: GraphQLList },
  }),
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args) {
        const user = await (await fetch(`${routes.users}/${args.id}`)).json();
        return user;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args) {
        const users = await (await fetch(routes.users)).json()
        return users;
      },
    },
  }
});

const schema = new GraphQLSchema({
	query: Query,
});

const routes = {
  users: `http://127.0.0.1:3000/users`
}

type TgraphqlBodySchema = {
  query: string;
  mutation: string;
  variables: object;
}

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
      const { query } = request.body as TgraphqlBodySchema;

      return await graphql({
        schema: schema,
        source: query,
        contextValue: fastify,
      });

    }
  );
};

export default plugin;
