import DB from "../DB/DB";
import { PostEntity } from "../DB/entities/DBPosts";
type CreatePostDTO = Omit<PostEntity, 'id'>;
type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;

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

export const postUpdating = async (db: DB, id: string, data: ChangePostDTO ) => {

    const post = await db.posts.findOne({
        key: "id",
        equals: id,
      });

      if (post) {
        const postDTO = post as ChangePostDTO;
        const postData = {
          ...postDTO,
          ...data
        }
        
        const query = await db.posts.change(id, postData);
        return query;
      }

      return Error('Post not found');
}