import { GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import DB from "../../../utils/DB/DB";
import { MemberTypeType, PostType, ProfileType, UserType } from "../gqlTypes";


export const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {

    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context: DB, variables) {
        //console.log(variables.variableValues);
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

    post: {
      type: PostType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context: DB, variables) {
        const post = await context.posts.findOne({key: "id", equals: args.id});
        return post;
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, context: DB) {
        const posts = await context.posts.findMany();
        return posts;
      },
    },

    profile: {
      type: ProfileType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context: DB, variables) {
        const post = await context.profiles.findOne({key: "id", equals: args.id});
        return post;
      },
    },

    profiles: {
      type: new GraphQLList(ProfileType),
      async resolve(parent, args, context: DB) {
        const posts = await context.profiles.findMany();
        return posts;
      },
    },

    memberType: {
      type: MemberTypeType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context: DB, variables) {
        const post = await context.memberTypes.findOne({key: "id", equals: args.id});
        return post;
      },
    },

    memberTypes: {
      type: new GraphQLList(MemberTypeType),
      async resolve(parent, args, context: DB) {
        const posts = await context.memberTypes.findMany();
        return posts;
      },
    },

    
  }
});