import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList } from 'graphql';
import { graphqlBodySchema } from './schema';
import fetch from 'node-fetch';
import { UserEntity } from '../../utils/DB/entities/DBUsers';

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
// type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

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

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: { 
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      async resolve(parent, args: CreateUserDTO) {
        const user = await (await fetch(routes.users, {
          method: 'post',
          body: JSON.stringify(args),
          headers: {
            'Content-Type': 'application/json',
          }
        })).json();
        return user;
      },
    },
  }
});

const schema = new GraphQLSchema({
	query: Query,
	mutation: Mutation,
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
