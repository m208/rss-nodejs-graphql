import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';


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
    async function (request, reply): Promise<UserEntity | null>  {
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

      // const validationResult = request.validateInput(request.body, createUserBodySchema)
      // console.log(validationResult)

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
    async function (request, reply): Promise<UserEntity | null> {
      const {id} = request.params as {id: string};

      const user = await fastify.db.users.findOne({key: "id", equals: id});
      if (user) {
        const query = await fastify.db.users.delete(id);
        return query;
      }
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
    async function (request, reply): Promise<UserEntity | null> {
      const {id} = request.params as {id: string};
      const {userId} = request.body as {userId: string}

      const user = await fastify.db.users.findOne({key: "id", equals: userId});

      if (user) {
        const query = await fastify.db.users.change(userId, {subscribedToUserIds : [...user.subscribedToUserIds, id]})
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
      const {id} = request.params as {id: string};
      const {userId} = request.body as {userId: string}

      const user = await fastify.db.users.findOne({key: "id", equals: userId});
      const subscribeOnUser = await fastify.db.users.findOne({key: "id", equals: id});

      if (!subscribeOnUser) {
        throw fastify.httpErrors.badRequest('User not found')
      }

      if (user && subscribeOnUser) {

        if (!user.subscribedToUserIds.includes(id)) {
          throw fastify.httpErrors.badRequest('body.userId is valid but our user is not following him');
        }

        const subscribes = user.subscribedToUserIds.filter(el=>el!==id )
        const query = await fastify.db.users.change(userId, {subscribedToUserIds : [...subscribes]})
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
      const user = await fastify.db.users.findOne({key: "id", equals: id});

      if (user) {
        const query = await fastify.db.users.change(id, request.body as ChangeUserDTO);
        return query;
      }
      throw fastify.httpErrors.badRequest('User not found');

    }

  );
};

export default plugin;

