import DB from "../DB/DB";
import { ProfileEntity } from "../DB/entities/DBProfiles";

type CreateProfileDTO = Omit<ProfileEntity, "id">;
//type ChangeProfileDTO = Partial<Omit<ProfileEntity, "id" | "userId">>;

export const profileCreation = async (db: DB, data: CreateProfileDTO) => {
    
    const user = await db.users.findOne({
        key: "id",
        equals: data.userId,
      });
      if (!user) {
        return Error("User with such id not found");
      }

      const memberType = await db.memberTypes.findOne({
        key: "id",
        equals: data.memberTypeId,
      });
      if (!memberType) {
        return Error("memberType with such id not found");
      }

      const profile = await db.profiles.findOne({
        key: "userId",
        equals: data.userId,
      });

      if (!profile) {
        const profile = await db.profiles.create( data );
        return profile;
      }
      
      return Error("User already has a profile");
}