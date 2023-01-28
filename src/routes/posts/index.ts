import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import { postCreation } from '../../utils/dbResolvers/posts';

type CreatePostDTO = Omit<PostEntity, 'id'>;
type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', 
  async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  }

  );

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {id} = request.params as {id: string};

      const post = await fastify.db.posts.findOne({key: "id", equals: id});
      if (!post) {
        throw fastify.httpErrors.notFound('Post not found');
      }

      return post;
    }

  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const query = await postCreation(fastify.db, request.body as CreatePostDTO)

      if (query instanceof Error) {
        throw fastify.httpErrors.badRequest(query.message);
      }
      return query;
    }

  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {id} = request.params as {id: string};

      const post = await fastify.db.posts.findOne({key: "id", equals: id});
      if (!post) {
        throw fastify.httpErrors.badRequest('Post not found');
      }

      const mutation = await fastify.db.posts.delete(id);
      return mutation;
    }

  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const {id} = request.params as {id: string};

      const post = await fastify.db.posts.findOne({key: "id", equals: id});
      if (!post) {
        throw fastify.httpErrors.badRequest('Post not found');
      }

      const mutation = await fastify.db.posts.change(id, request.body as ChangePostDTO);
      return mutation; 

    }

  );
};

export default plugin;
