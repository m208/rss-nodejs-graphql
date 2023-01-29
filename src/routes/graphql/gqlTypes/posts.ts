import { GraphQLObjectType, GraphQLString,  GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

export const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: { type: GraphQLString },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
      userId: { type: GraphQLString },
    }),
});

export const PostCreationType = new GraphQLInputObjectType({
    name: 'PostCreation',
    fields: () => ({
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
      userId: { type: new GraphQLNonNull(GraphQLString) },
    }),
});

export const PostUpdatingType = new GraphQLInputObjectType({
    name: 'PostUpdating',
    fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLString) },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    }),
});

