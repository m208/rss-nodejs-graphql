import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { createProfileBodySchema, changeProfileBodySchema } from "./schema";
import type { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
import { profileCreation } from "../../utils/dbResolvers/profiles";

type CreateProfileDTO = Omit<ProfileEntity, "id">;
type ChangeProfileDTO = Partial<Omit<ProfileEntity, "id" | "userId">>;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<ProfileEntity[]> {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params as { id: string };

      const query = await fastify.db.profiles.findOne({
        key: "id",
        equals: id,
      });
      if (query) return query;

      throw fastify.httpErrors.notFound("Profile not found");
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const data = request.body as CreateProfileDTO;

      const query = await profileCreation(fastify.db, data);

      if (query instanceof Error) {
        throw fastify.httpErrors.badRequest(query.message);
      }
      return query;

    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params as { id: string };

      const profile = await fastify.db.profiles.findOne({
        key: "id",
        equals: id,
      });

      if (profile) {
        const mutation = await fastify.db.profiles.delete(id);
        return mutation;
      }
      throw fastify.httpErrors.badRequest("Profile not found");
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { id } = request.params as { id: string };

      const profile = await fastify.db.profiles.findOne({
        key: "id",
        equals: id,
      });

      if (profile) {
        const mutation = await fastify.db.profiles.change(
          id,
          request.body as ChangeProfileDTO
        );
        return mutation;
      }

      throw fastify.httpErrors.badRequest("Profile not found");
    }
  );
};

export default plugin;
