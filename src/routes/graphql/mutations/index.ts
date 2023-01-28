import { GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import DB from "../../../utils/DB/DB";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { UserType } from "../gqlTypes";

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

export const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addUser: {
        type: UserType,
        args: { 
          firstName: { type: GraphQLString },
          lastName: { type: GraphQLString },
          email: { type: GraphQLString },
        },
        async resolve(parent, args: CreateUserDTO, context: DB, variables) {
          if (!args.email || !args.firstName || !args.lastName){
            throw new Error('Not all required fields provided');
          }
          
          const user = await context.users.create(variables.variableValues as CreateUserDTO);
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