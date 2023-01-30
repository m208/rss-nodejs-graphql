
import DataLoader = require('dataloader');
import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';
import { PostEntity } from '../../../utils/DB/entities/DBPosts';
import { ProfileEntity } from '../../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { MemberTypeType } from './memberTypes';
import { PostType } from './posts';
import { ProfileType } from './profiles';

export const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: GraphQLString },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
      subscribedToUserIds: { type: new GraphQLList(GraphQLString)},
    }),
});

// @ts-ignore
export const UserWithContentType = new GraphQLObjectType({
    name: 'UserWithContent',
    fields: () => ({
      id: { type: GraphQLString },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
      subscribedToUserIds: { type: new GraphQLList(GraphQLString)},
      
      posts: {
        type: new GraphQLList(PostType),
        resolve: async (parent, args, context) => {
          return await context.db.posts.findMany({key: "userId", equals: parent.id});
        }
      },

      profile: {
        type: ProfileType,
        resolve: async (parent, args, context, info) => {
          // DEFAULT
          // return await context.db.profiles.findOne({key: "userId", equals: parent.id});

          // DATALOADER!
          const { dataloaders } = context;
          let dl = dataloaders.get(info.fieldNodes);

          if (!dl) {
            dl = new DataLoader(async (keys: readonly string[]) => {
              const items: PostEntity[] = await context.db.profiles.findMany({ key: "userId", equalsAnyOf: keys })
              const sortedInIdsOrder = keys.map(id => items.find(x => x.userId === id));
              return sortedInIdsOrder;
            });

            dataloaders.set(info.fieldNodes, dl);
          }
          return dl.load(parent.id);
          //  ----------------
        }
      },

      memberType: {
        type: MemberTypeType,
        resolve: async (parent, args, context, info) => {
          // DEFAULT
          // const profile = await context.db.profiles.findOne({key: "userId", equals: parent.id});
          // return await context.db.memberTypes.findOne({key: "id", equals: profile.memberTypeId});

          // DATALOADER!
          const { dataloaders } = context;
          let dl = dataloaders.get({...info.fieldNodes, 'data': 'profile'});
 
          if (!dl) {
            dl = new DataLoader(async (keys: readonly string[]) => {
              const items: ProfileEntity[] = await context.db.profiles.findMany({ key: "userId", equalsAnyOf: keys })
              const sortedInIdsOrder = keys.map(id => items.find(x => x.userId === id));
              return sortedInIdsOrder;
            });
            dataloaders.set({...info.fieldNodes, 'data': 'profile'}, dl);
          }
          const profile = await dl.load(parent.id);
          
          
          let dl2 = dataloaders.get({...info.fieldNodes, 'data': 'membertype'});
          if (!dl2) {
            dl2 = new DataLoader(async (keys: readonly string[]) => {
              const items: MemberTypeEntity[] = await context.db.memberTypes.findMany({ key: "id", equalsAnyOf: keys })
              const sortedInIdsOrder = keys.map(id => items.find(x => x.id === id));
              return sortedInIdsOrder;
            });
            dataloaders.set({...info.fieldNodes, 'data': 'membertype'}, dl2);
          }

          return dl2.load(profile.memberTypeId);

          //  -----------
        }
      },

      userSubscribedTo: {
        type: new GraphQLList(UserWithContentType),
        resolve: async (parent, args, context, info) => {
          // DEFAULT
          // return await context.db.users.findMany({
          //   key: "subscribedToUserIds", inArray: parent.id
          // });
          
          // DATALOADER!
          const { dataloaders } = context;
          let dl = dataloaders.get(info.fieldNodes);

          if (!dl) {
            dl = new DataLoader(async (keys: readonly string[]) => {
              const items: UserEntity[] = await context.db.users.findMany({ key: "subscribedToUserIds", inArrayAnyOf: keys })
              const sortedInIdsOrder = keys.map(id => [...items].filter(x => x.subscribedToUserIds.includes(id)));
              return sortedInIdsOrder;
            });

            dataloaders.set(info.fieldNodes, dl);
          }
          return dl.load(parent.id);
          //  ----------------  OK

        }
      },

      subscribedToUser: {
        type: new GraphQLList(UserWithContentType),
        resolve: async (parent, args, context, info) => {
          //console.log('subscribedToUser');
          
          // DEFAULT
          // return await context.db.users.findMany({
          //   key: "id", equalsAnyOf: parent.subscribedToUserIds
          // });
          
          // DATALOADER!
          const { dataloaders } = context;
          //let dl = dataloaders.get({...info.fieldNodes, "data": "subscribedToUser"});
          let dl = dataloaders.get(info.fieldNodes);

          if (!dl) {
            dl = new DataLoader(async (keys: readonly string[]) => {
              const items: UserEntity[] = await context.db.users.findMany({ key: "id", equalsAnyOf: keys })
              const sortedInIdsOrder = keys.map(id => [...items].filter(x => x.id === id));
              return sortedInIdsOrder;
            });

            dataloaders.set(info.fieldNodes, dl);
          }
          return dl.load(...parent.subscribedToUserIds);
          //  ----------------   OK       
        }
      },
      
    }),
});

export const UsersWithSubsAndProfilesType = new GraphQLObjectType({
    name: 'UsersWithSubsAndProfiles',
    fields: () => ({
      id: { type: GraphQLString },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
      subscribedToUserIds: { type: new GraphQLList(GraphQLString)},

      profile: {
        type: ProfileType,
        resolve: async (parent, args, context, info) => {
          // HERE DATALOADER!
          const { dataloaders } = context;
          let dl = dataloaders.get(info.fieldNodes);

          if (!dl) {
            dl = new DataLoader(async (keys: readonly string[]) => {
             
              const items: PostEntity[] = await context.db.profiles.findMany({ key: "userId", equalsAnyOf: keys })
              const sortedInIdsOrder = keys.map(id => items.find(x => x.userId === id));
              return sortedInIdsOrder;
              return items

            });

            dataloaders.set(info.fieldNodes, dl);
          }
  
          return dl.load(parent.id);
          return await context.db.profiles.findOne({key: "userId", equals: parent.id});

        }
      },
      
      userSubscribedTo: {
        type: new GraphQLList(UserType),
        resolve: async (parent, args, context, info) => {

          // const users = await context.db.users.findMany({ key: "subscribedToUserIds", inArrayAnyOf: [parent.id] })
          // console.log("iser: ", parent.id, users );
          


          return await context.db.users.findMany({key: "subscribedToUserIds", inArray: parent.id});
          
          const { dataloaders } = context;
          let dl = dataloaders.get(info.fieldNodes);
          //console.log(2, dl);
          
          if (!dl) {
            dl = new DataLoader(async (keys: readonly string[]) => {
              // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!");
              // console.log(keys);
              // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!");


              //const items = await context.db.users.findMany({ key: "subscribedToUserIds", equalsAnyOf: keys })
              const items: UserEntity[] = await context.db.users.findMany();

              const subs = keys.map(key=>{
                const id = key
                const arr = items.filter(el=>el.subscribedToUserIds.includes(id))
                return arr.toString()
              })


              console.log('SUB!!!');
              console.log(subs);
              
              //return subs
              
             
              const sortedInIdsOrder = keys.map(key => {
                console.log(key);
                
                const itm = items.find(x => x.subscribedToUserIds.includes(key))
                console.log(itm);
                
                return itm
              });
              console.log(sortedInIdsOrder);
              

              
              return sortedInIdsOrder;
              


               console.log('USERS');
              // console.log(items);


              return items;

            });

            dataloaders.set(info.fieldNodes, dl);
          }
          // const res = await dl.load(parent.id);
          // console.log('#####################################################');
          
          // console.log(parent.id, res);
          
          return dl.load(parent.id);

          return dl.loadMany([parent.id]);
          return [dl.load(parent.id)];

          return await context.db.users.findMany({key: "subscribedToUserIds", inArray: parent.id});
        }
      },
      

      
      //subscribedToUser: {type: new GraphQLList(UserWithContentType)},
    }),
});

export const UserWithSubsAndPostsType = new GraphQLObjectType({
    name: 'UserWithSubsAndPosts',
    fields: () => ({
      id: { type: GraphQLString },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
      subscribedToUserIds: { type: new GraphQLList(GraphQLString)},

      posts: {
        type: new GraphQLList(PostType),
        resolve: async (parent, args, context, info) => {
            return await context.db.posts.findMany({key: "userId", equals: parent.id});
        }
      },

      subscribedToUser: {
        type: new GraphQLList(UserType),
        resolve: async (parent, args, context) => {
          // HERE DATALOADER!?
          return await context.db.users.findMany({key: "subscribedToUserIds", inArray: parent.id});
        }
      },

    }),
});

export const UsersWithSubsType = new GraphQLObjectType({
    name: 'UsersWithSubs',
    fields: () => ({
      id: { type: GraphQLString },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
      subscribedToUserIds: { type: new GraphQLList(GraphQLString)},

      subscribedToUser: {
        type: new GraphQLList(UserWithContentType),
        resolve: async (parent, args, context) => {
          // HERE DATALOADER!?
          return await context.db.users.findMany({
            key: "subscribedToUserIds", inArray: parent.id
          }); // here is ok
        }
      },
      
      userSubscribedTo: {
        type: new GraphQLList(UserWithContentType),
        resolve: async (parent, args, context, info) => {
          return await context.db.users.findMany({
            key: "id", equalsAnyOf: parent.subscribedToUserIds
          }); //must be changed
        }
      },


    }),
});


export const UserCreationType = new GraphQLInputObjectType({
    name: 'UserCreation',
    fields: {
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
    }
});

export const UserUpdatingType = new GraphQLInputObjectType({
    name: 'UserUpdating',
    fields: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
      subscribedToUserIds: { type: new GraphQLList(GraphQLString)},
    }
});

export const UserSubscribingType = new GraphQLInputObjectType({
    name: 'UserSubscribing',
    fields: {
      user1ID: { type: new GraphQLNonNull(GraphQLString) },
      user2ID: { type: new GraphQLNonNull(GraphQLString) },
    }
});

export const UserUnSubscribingType = new GraphQLInputObjectType({
    name: 'UserUnSubscribing',
    fields: {
      user1ID: { type: new GraphQLNonNull(GraphQLString) },
      user2ID: { type: new GraphQLNonNull(GraphQLString) },
    }
});