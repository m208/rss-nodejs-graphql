import DB from "../DB/DB";
import { UserEntity } from "../DB/entities/DBUsers";

type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

export const userUpdating = async (db: DB, id: string, data: ChangeUserDTO) => {
  
  const user = await db.users.findOne({key: "id", equals: id});

  if (user) {
    const {email, firstName, lastName, subscribedToUserIds} = user;
    const userData = {
      email,
      firstName,
      lastName,
      subscribedToUserIds,
      ...data
    }
    
    const query = await db.users.change(id, userData);
    return query;
  }

  return Error('User not found');
}


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

export const userSubscribing = async (db: DB, user1ID: string, user2ID: string) => {
    const user1 = await db.users.findOne({key: "id", equals: user1ID});
    const user2 = await db.users.findOne({key: "id", equals: user2ID});

    if (user1 && user2) {
      const query = await db.users.change(user2ID, {
        subscribedToUserIds : [...user2.subscribedToUserIds, user1ID]
      })
      return query;
    }

    return Error ("User not existed");
}

export const userUnSubscribing = async (db: DB, user1ID: string, user2ID: string) => {
    const user1 = await db.users.findOne({key: "id", equals: user1ID});
    const user2 = await db.users.findOne({key: "id", equals: user2ID});

    if (user1 && user2) {
      if (!user2.subscribedToUserIds.includes(user1ID)) {
        return Error('body.userId is valid but our user is not following him');
      }

      const subscribes = user2.subscribedToUserIds.filter(el=>el!==user1ID )
      const query = await db.users.change(user2ID, {subscribedToUserIds : [...subscribes]})
      return query;
    }

    return Error ("User not existed");
}