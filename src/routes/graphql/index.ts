import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList } from 'graphql';
import { graphqlBodySchema } from './schema';
import { UserEntity } from '../../utils/DB/entities/DBUsers';
import DB from '../../utils/DB/DB';

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString)},
  }),
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context: DB) {
        const user = await context.users.findOne({key: "id", equals: args.id});
        return user;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context: DB) {
        const users = await context.users.findMany();
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
      async resolve(parent, args: CreateUserDTO, context: DB) {
        const user = await context.users.create(args);
        return user;
      },
    },
    updateUser: {
      type: UserType,
      args: { 
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        subscribedToUserIds: { type: new GraphQLList(GraphQLString)},
      },
      async resolve(parent, args, context: DB) {
        const user = await context.users.change(args.id, args as ChangeUserDTO);
        return user;
      },
    },
    deleteUser: {
      type: UserType,
      args: { 
        id: { type: GraphQLString },
      },
      async resolve(parent, args, context: DB) {
        const user = await context.users.change(args.id, args as ChangeUserDTO);
        return user;
      },
    },
  }
});

const schema = new GraphQLSchema({
	query: Query,
	mutation: Mutation,
});

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
        contextValue: fastify.db,
      });

    }
  );
};

export default plugin;
