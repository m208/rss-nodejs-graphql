import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', 
  async function (request, reply): Promise< MemberTypeEntity[] > {
    return await fastify.db.memberTypes.findMany();
  }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const {id} = request.params as {id: string};

      const query = await fastify.db.memberTypes.findOne({key: "id", equals: id});
      if ( query) return query;
      throw fastify.httpErrors.notFound('User not found');
      
    }

  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const {id} = request.params as {id: string};

      const query = await fastify.db.memberTypes.findOne({key: "id", equals: id});
      if (!query) throw fastify.httpErrors.badRequest('User not found');

      const mutation = await fastify.db.memberTypes.change(id, request.body as Partial<Omit<MemberTypeEntity, "id">>);
      return mutation;
    }

  );
};

export default plugin;
