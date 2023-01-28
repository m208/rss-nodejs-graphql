import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import DB from "../../../utils/DB/DB";
import { PostEntity } from "../../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { postCreation, postUpdating } from "../../../utils/dbResolvers/posts";
import { profileCreation, profileUpdating } from "../../../utils/dbResolvers/profiles";
import { userUpdating } from "../../../utils/dbResolvers/users";
import { PostType, ProfileType, UserType } from "../gqlTypes";

type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;
type CreateProfileDTO = Omit<ProfileEntity, "id">;
type ChangeProfileDTO = Partial<Omit<ProfileEntity, "id" | "userId">>;

type CreatePostDTO = Omit<PostEntity, 'id'>;
type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;

export const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {

      createUser: {
        type: UserType,
        args: { 
          firstName: { type: new GraphQLNonNull(GraphQLString) },
          lastName: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
        },
        async resolve(parent, args: CreateUserDTO, context: DB) {
          const user = await context.users.create(args);
          return user;
        },
      },

      updateUser: {
        type: UserType,
        args: { 
          id: { type: new GraphQLNonNull(GraphQLString) },
          firstName: { type: GraphQLString },
          lastName: { type: GraphQLString },
          email: { type: GraphQLString },
          subscribedToUserIds: { type: new GraphQLList(GraphQLString)},
        },
        async resolve(parent, args, context: DB) {
          const query = await userUpdating(context, args.id, args as ChangeUserDTO);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

      createProfile: {
        type: ProfileType,
        args: { 
          avatar: { type: new GraphQLNonNull(GraphQLString) },
          sex: { type: new GraphQLNonNull(GraphQLString) },
          birthday: { type: new GraphQLNonNull(GraphQLInt) },
          country: { type: new GraphQLNonNull(GraphQLString) },
          street: { type: new GraphQLNonNull(GraphQLString) },
          city: { type: new GraphQLNonNull(GraphQLString) },
          memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
          userId: { type: new GraphQLNonNull(GraphQLString) },
        },
        async resolve(parent, args, context: DB) {
          const query = profileCreation(context, args as CreateProfileDTO);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        }, 
      },

      updateProfile: {
        type: ProfileType,
        args: { 
          id: { type: new GraphQLNonNull(GraphQLString) },
          avatar: { type: GraphQLString },
          sex: { type: GraphQLString },
          birthday: { type: GraphQLInt },
          country: { type: GraphQLString },
          street: { type: GraphQLString },
          city: { type: GraphQLString },
          memberTypeId: { type: GraphQLString },
          userId: { type: GraphQLString },
        },
        async resolve(parent, args, context: DB) {
          const query = profileUpdating(context, args.id, args as ChangeProfileDTO);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        }, 
      },

      createPost: {
        type: PostType,
        args: { 
          title: { type: new GraphQLNonNull(GraphQLString) },
          content: { type: new GraphQLNonNull(GraphQLString) },
          userId: { type: new GraphQLNonNull(GraphQLString) },
        },
        async resolve(parent, args: CreatePostDTO, context: DB) {
          const query = await postCreation(context, args);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

      updatePost: {
        type: PostType,
        args: { 
          id: { type: new GraphQLNonNull(GraphQLString) },
          title: { type: GraphQLString },
          content: { type: GraphQLString },
        },
        async resolve(parent, args, context: DB) {
          const query = await postUpdating(context, args.id, args as ChangePostDTO);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

    }
  });