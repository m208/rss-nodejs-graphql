import { GraphQLObjectType, GraphQLString,  GraphQLInt, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

export const MemberTypeType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type: GraphQLString },
      discount: { type: GraphQLInt },
      monthPostsLimit: { type: GraphQLInt },
    }),
});

export const MemberTypeUpdatingType = new GraphQLInputObjectType({
    name: 'MemberTypeUpdating',
    fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLString) },
      discount: { type: GraphQLInt },
      monthPostsLimit: { type: GraphQLInt },
    }),
});