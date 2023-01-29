import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
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
      
      posts: {type: new GraphQLList(PostType)},
      profile: {type: ProfileType},
      memberType: {type: MemberTypeType}
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