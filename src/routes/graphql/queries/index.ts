import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import DB from "../../../utils/DB/DB";
import { MemberTypeType } from "../gqlTypes/memberTypes";
import { PostType } from "../gqlTypes/posts";
import { ProfileType } from "../gqlTypes/profiles";
import { UserType, UserWithContentType, UserWithSubsType } from "../gqlTypes/users";


export const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {

    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
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

    usersWithContent: {
      type: new GraphQLList(UserWithContentType),
      
      async resolve(parent, args, context: DB) {
        const users = await context.users.findMany();

        const content = users.map(async user => {
          const posts = await context.posts.findMany({key: "userId", equals: user.id});
          const profile = await context.profiles.findOne({key: "userId", equals: user.id});
          const memberType = await context.memberTypes.findOne({key: "id", equals: user.id})
          return {
            ...user,
            posts,
            profile,
            memberType
          }
        })

        return content;
      }
    },

    userWithContent: {
      type: UserWithContentType,
      
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(parent, args, context: DB) {
        const user = await context.users.findOne({key: "id", equals: args.id});
        if (!user) return;

        const posts = await context.posts.findMany({key: "userId", equals: user.id});
        const profile = await context.profiles.findOne({key: "userId", equals: user.id});
        const memberType = await context.memberTypes.findOne({key: "id", equals: user.id})

        return {
          ...user,
          posts,
          profile,
          memberType
        }

      }
    },

    usersWithSubsAndProfiles: {
      type: new GraphQLList(UserWithContentType),
      
      async resolve(parent, args, context: DB) {
        const users = await context.users.findMany();

        const data = users.map(async user => {
          const profile = await context.profiles.findOne({key: "userId", equals: user.id});

          const userSubscribedTo = [...users].filter(usr=>{
            return usr.subscribedToUserIds.includes(user.id)
          })

          return {
            ...user,
            profile,
            userSubscribedTo
          }
        })

        return data;

      }
    },

    userWithSubsAndPosts: {
      type: UserWithContentType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      
      async resolve(parent, args, context: DB) {
        const user = await context.users.findOne({key: "id", equals: args.id});
        if (!user) return;

        const posts = await context.posts.findMany({key: "userId", equals: user.id});
        
        const subscribedToUser = await context.users.findMany({
          key: "subscribedToUserIds", inArray: user.id
        });

        return {
          ...user,
          posts,
          subscribedToUser
        }

      }
    },

    usersWithSubs: {
      type: new GraphQLList(UserWithSubsType),
      
      async resolve(parent, args, context: DB) {
        const users = await context.users.findMany();

        const data = users.map(async user => {

          const userSubscribedTo = [...users].filter(usr=>{
            return usr.subscribedToUserIds.includes(user.id)
          }).map(item=>({
            ...item,
            userSubscribedTo: [...users].filter(usr=>{
              return usr.subscribedToUserIds.includes(item.id)
            })
          })
          )

          const subs = await context.users.findMany({
            key: "subscribedToUserIds", inArray: user.id
          })

          const subscribedToUser = subs.map(async item=>({
              ...item,
              subscribedToUser: await context.users.findMany({
                key: "subscribedToUserIds", inArray: user.id
              })
          }))


          return {
            ...user,
            userSubscribedTo,
            subscribedToUser
          }
        })

        return data;

      }
    },


    post: {
      type: PostType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args, context: DB) {
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
      async resolve(parent, args, context: DB) {
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
      async resolve(parent, args, context: DB) {
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