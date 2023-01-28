import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { userDeletion, userUpdating } from '../../utils/dbResolvers/users';


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

      const user2 = await fastify.db.users.findOne({key: "id", equals: user2ID});

      if (user2) {
        const query = await fastify.db.users.change(user2ID, {
          subscribedToUserIds : [...user2.subscribedToUserIds, user1ID]
        })
        return query;
      }
      throw fastify.httpErrors.notFound('User not found');
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

      const user1 = await fastify.db.users.findOne({key: "id", equals: user1ID});
      const user2 = await fastify.db.users.findOne({key: "id", equals: user2ID});

      if (!user2) {
        throw fastify.httpErrors.badRequest('User not found')
      }

      if (user1 && user2) {

        if (!user2.subscribedToUserIds.includes(user1ID)) {
          throw fastify.httpErrors.badRequest('body.userId is valid but our user is not following him');
        }

        const subscribes = user2.subscribedToUserIds.filter(el=>el!==user1ID )
        const query = await fastify.db.users.change(user2ID, {subscribedToUserIds : [...subscribes]})
        return query;

      }
      throw fastify.httpErrors.notFound('User not found');
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

