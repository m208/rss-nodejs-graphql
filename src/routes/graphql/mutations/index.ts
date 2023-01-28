import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import DB from "../../../utils/DB/DB";
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { profileCreation } from "../../../utils/dbResolvers/profiles";
import { ProfileType, UserType } from "../gqlTypes";

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;
type CreateProfileDTO = Omit<ProfileEntity, "id">;

export const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {

      createUser: {
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

      createProfile: {
        type: ProfileType,
        args: { 
          id: { type: GraphQLString },
          avatar: { type: GraphQLString },
          sex: { type: GraphQLString },
          birthday: { type: GraphQLInt },
          country: { type: GraphQLString },
          street: { type: GraphQLString },
          city: { type: GraphQLString },
          memberTypeId: { type: GraphQLString },
          userId: { type: GraphQLString },
        },
        async resolve(parent, args, context: DB, variables) {
          const query = profileCreation(context, args as CreateProfileDTO);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

    }
  });