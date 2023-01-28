import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { userDeletion, userSubscribing, userUnSubscribing, userUpdating } from '../../utils/dbResolvers/users';


type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {

    const users = fastify.db.users.findMany();
    return users;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity>  {
      const {id} = request.params as {id: string};
      const user = await fastify.db.users.findOne({key: "id", equals: id});
     
      if (user) {
        return user;
      } 

      throw fastify.httpErrors.notFound('User not found');

    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
        const user = await fastify.db.users.create(request.body as CreateUserDTO);
        return user;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {id} = request.params as {id: string};

      const query = await userDeletion(fastify.db, id);
      if (query) return query;

      throw fastify.httpErrors.badRequest('User not found');

    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {id: user1ID} = request.params as {id: string};
      const {userId: user2ID} = request.body as {userId: string};

      const query = await userSubscribing(fastify.db, user1ID, user2ID);

      if (query instanceof Error) {
        throw fastify.httpErrors.badRequest(query.message);
      }
      return query;
      
    }

  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {id: user1ID} = request.params as {id: string};
      const {userId: user2ID} = request.body as {userId: string};

      const query = await userUnSubscribing(fastify.db, user1ID, user2ID);

      if (query instanceof Error) {
        throw fastify.httpErrors.badRequest(query.message);
      }
      return query;

    }

  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const {id} = request.params as {id: string};

      const query = await userUpdating(fastify.db, id, request.body as ChangeUserDTO);
      
      if (query instanceof Error) {
        throw fastify.httpErrors.badRequest(query.message);
      }
      return query;

    }

  );
};

export default plugin;

