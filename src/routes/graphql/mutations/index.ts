import { GraphQLNonNull, GraphQLObjectType } from "graphql";
// import DB from "../../../utils/DB/DB";
import { memberTypeUpdating } from "../../../utils/dbResolvers/memberTypes";
import { postCreation, postUpdating } from "../../../utils/dbResolvers/posts";
import { profileCreation, profileUpdating } from "../../../utils/dbResolvers/profiles";
import { userSubscribing, userUnSubscribing, userUpdating } from "../../../utils/dbResolvers/users";
import { UserCreationType, UserSubscribingType, UserType, UserUnSubscribingType, UserUpdatingType } from "../gqlTypes/users";
import { ProfileCreationType, ProfileType, ProfileUpdatingType } from "../gqlTypes/profiles";
import { PostCreationType, PostType, PostUpdatingType } from "../gqlTypes/posts";
import { MemberTypeType, MemberTypeUpdatingType } from "../gqlTypes/memberTypes";
import { AppDB } from "../queries";


export const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {

      createUser: {
        type: UserType,
        args: { 
          data: {type: new GraphQLNonNull(UserCreationType) },
        },
        async resolve(parent, args, context: AppDB) {
          const user = await context.db.users.create(args.data);
          return user;
        },
      },

      updateUser: {
        type: UserType,
        args: { 
          data: { type: new GraphQLNonNull(UserUpdatingType) },
        },
        async resolve(parent, args, context: AppDB) {
          const query = await userUpdating(context.db, args.data.id, args.data);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

      createProfile: {
        type: ProfileType,
        args: { 
          data: { type: new GraphQLNonNull(ProfileCreationType) },
        },
        async resolve(parent, args, context: AppDB) {
          const query = profileCreation(context.db, args.data);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        }, 
      },

      updateProfile: {
        type: ProfileType,
        args: { 
          data: { type: new GraphQLNonNull(ProfileUpdatingType) },
        },
        async resolve(parent, args, context: AppDB) {
          const query = profileUpdating(context.db, args.data.id, args.data);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        }, 
      },

      createPost: {
        type: PostType,
        args: { 
          data: { type: new GraphQLNonNull(PostCreationType) },
        },
        async resolve(parent, args, context) {
          const query = await postCreation(context.db, args.data);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

      updatePost: {
        type: PostType,
        args: { 
          data: { type: new GraphQLNonNull(PostUpdatingType) },
        },
        async resolve(parent, args, context) {
          const query = await postUpdating(context.db, args.data.id, args.data);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

      updateMemberType: {
        type: MemberTypeType,
        args: { 
          data: { type: new GraphQLNonNull(MemberTypeUpdatingType) },
        },
        async resolve(parent, args, context) {
          const query = await memberTypeUpdating(context.db, args.data.id, args.data );
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

      subscribeUser: {
        type: UserType,
        args: { 
          data: { type: new GraphQLNonNull(UserSubscribingType) },
        },
        async resolve(parent, args, context) {
          const query = await userSubscribing(context.db, args.data.user1ID, args.data.user2ID);
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

      unSubscribeUser: {
        type: UserType,
        args: { 
          data: { type: new GraphQLNonNull(UserUnSubscribingType) },
        },
        async resolve(parent, args, context) {
          const query = await userUnSubscribing(context.db, args.data.user1ID, args.data.user2ID );
          if (query instanceof Error) {
            throw query;
          }
          return query;
        },
      },

    }
  });