import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';
import { memberTypeUpdating } from '../../utils/dbResolvers/memberTypes';

type ChangeMemberTypeDTO = Partial<Omit<MemberTypeEntity, 'id'>>;

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

      const query = await memberTypeUpdating(fastify.db, id, request.body as ChangeMemberTypeDTO);
      
      if (query instanceof Error) {
        throw fastify.httpErrors.badRequest(query.message);
      }
      return query;

    }

  );
};

export default plugin;
