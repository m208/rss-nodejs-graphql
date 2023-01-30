import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import DB from "../../../utils/DB/DB";
import { MemberTypeType } from "../gqlTypes/memberTypes";
import { PostType } from "../gqlTypes/posts";
import { ProfileType } from "../gqlTypes/profiles";
import { 
  UserType, 
  UserWithContentType, 
} from "../gqlTypes/users";

export type AppDB = {
  db: DB,
  dataloaders: WeakMap<object, any>
}

export const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {

    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(parent, args, context) {
        const user = await context.db.users.findOne({key: "id", equals: args.id});
        return user;
      },
    },

    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context) {
        const users = await context.db.users.findMany();
        return users;
      },
    },

    usersWithContent: {
      type: new GraphQLList(UserWithContentType),
      async resolve(parent, args, context) {
        return await context.db.users.findMany();
      }
    },

    userWithContent: {
      type: UserWithContentType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(parent, args, context) {
        return await context.db.users.findOne({key: "id", equals: args.id});
      }
    },

    usersWithSubsAndProfiles: {
      type: new GraphQLList(UserWithContentType),
      
      async resolve(parent, args, context: AppDB) {
        const users = await context.db.users.findMany();
        return users;
      }
    },

    userWithSubsAndPosts: {
      type: UserWithContentType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      
      async resolve(parent, args, context) {
        const user = await context.db.users.findOne({key: "id", equals: args.id});
        return user
      }
    },

    usersWithSubs: {
      type: new GraphQLList(UserWithContentType),
      
      async resolve(parent, args, context: AppDB) {
        const users = await context.db.users.findMany();
        return users;
      }
    },


    post: {
      type: PostType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context) {
        const post = await context.db.posts.findOne({key: "id", equals: args.id});
        return post;
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, context) {
        const posts = await context.db.posts.findMany();
        return posts;
      },
    },

    profile: {
      type: ProfileType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context) {
        const post = await context.db.profiles.findOne({key: "id", equals: args.id});
        return post;
      },
    },

    profiles: {
      type: new GraphQLList(ProfileType),
      async resolve(parent, args, context) {
        const posts = await context.db.profiles.findMany();
        return posts;
      },
    },

    memberType: {
      type: MemberTypeType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context) {
        const post = await context.db.memberTypes.findOne({key: "id", equals: args.id});
        return post;
      },
    },

    memberTypes: {
      type: new GraphQLList(MemberTypeType),
      async resolve(parent, args, context) {
        const posts = await context.db.memberTypes.findMany();
        return posts;
      },
    },

  }
});