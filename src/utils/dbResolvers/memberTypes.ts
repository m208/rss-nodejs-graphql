import DB from "../DB/DB";
import { MemberTypeEntity } from "../DB/entities/DBMemberTypes";

type ChangeMemberTypeDTO = Partial<Omit<MemberTypeEntity, 'id'>>;

export const memberTypeUpdating = async (db: DB, id: string, data: ChangeMemberTypeDTO) => {
    const memberType = await db.memberTypes.findOne({key: "id", equals: id});
    
    if (!memberType) return Error('MemberType not found');
    const { discount, monthPostsLimit} = memberType;
    const memberTypeData = {
        discount,
        monthPostsLimit,
      ...data
    }

    const query = await db.memberTypes.change(id, memberTypeData);
    return query;
}