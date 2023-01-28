import DB from "../DB/DB";

export const userDeletion = async (db: DB, id: string) => {
    const user = await db.users.findOne({key: "id", equals: id});

    if (user) {
        const relatedProfile = await db.profiles.findOne({
          key: "userId", equals: id
        });

        if (relatedProfile) {
          await db.profiles.delete(relatedProfile.id);
        }

        const relatedPosts = await db.posts.findMany({
          key: "userId", equals: id
        });

        for (const post of relatedPosts) {
          await db.posts.delete(post.id);
        }

        const subscribers = await db.users.findMany({
          key: "subscribedToUserIds", inArray: id
        });

        for (const sub of subscribers) {
          await  db.users.change(sub.id, {
            subscribedToUserIds: sub.subscribedToUserIds.filter(el=>el!==id)
          })
        }

        const mutation = await db.users.delete(id);
        return mutation;
      }

      return null;
}