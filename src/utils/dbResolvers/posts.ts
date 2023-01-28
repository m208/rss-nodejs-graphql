import DB from "../DB/DB";
import { PostEntity } from "../DB/entities/DBPosts";
type CreatePostDTO = Omit<PostEntity, 'id'>;
//type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;

export const postCreation = async (db: DB, data: CreatePostDTO) => {
    
    const user = await db.users.findOne({
        key: "id",
        equals: data.userId,
    });

    if (!user) {
        return Error("User with such id not found");
    }

    const post = await db.posts.create(data);
    return post;

    
}