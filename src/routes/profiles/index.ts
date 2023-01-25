import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { createProfileBodySchema, changeProfileBodySchema } from "./schema";
import type { ProfileEntity } from "../../utils/DB/entities/DBProfiles";

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

      const user = await fastify.db.users.findOne({
        key: "id",
        equals: data.userId,
      });
      if (!user) {
        throw fastify.httpErrors.badRequest("User with such id not found");
      }

      const memberType = await fastify.db.memberTypes.findOne({
        key: "id",
        equals: data.memberTypeId,
      });
      if (!memberType) {
        throw fastify.httpErrors.badRequest(
          "memberType with such id not found"
        );
      }

      const profile = await fastify.db.profiles.findOne({
        key: "userId",
        equals: data.userId,
      });

      if (!profile) {
        const profile = await fastify.db.profiles.create(
          request.body as CreateProfileDTO
        );
        return profile;
      }

      throw fastify.httpErrors.badRequest("User already has a profile");
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
