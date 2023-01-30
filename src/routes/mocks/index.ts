import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import fetch from "node-fetch";
import { mockedProfiles, mockedUsers } from "./entries";


const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
    fastify
  ): Promise<void> => {
    fastify.get('/', 
    async function (request, reply) {

        const usersId = [];
        for (const mock of mockedUsers){

            const user = await (await fetch('http://127.0.0.1:3000/users/', {
                method: 'post',
                body: JSON.stringify(mock),
                headers: {'Content-Type': 'application/json'}
            })).json();

            usersId.push(user.id)
        }

        const profilesId = []
        for (const [index, value] of usersId.entries()){

            const profile = await (await fetch('http://127.0.0.1:3000/profiles/', {
                method: 'post',
                body: JSON.stringify({
                    ...mockedProfiles[index],
                    userId: value
                }),
                headers: {'Content-Type': 'application/json'}
            })).json();
            profilesId.push(profile.id);
        }

        let postCounter = 0;
        const maxPostsPerUser = 5;
        for (const [index, value] of usersId.entries()) {

            const randomCount = maxPostsPerUser;
            //const randomCount = Math.floor(Math.random() * maxPostsPerUser);
            
            for (let i = 0; i < randomCount; i++) {
                postCounter += 1;

                await fetch('http://127.0.0.1:3000/posts/', {
                    method: 'post',
                    body: JSON.stringify({
                        title: `post ${i+1} of ${randomCount}`,
                        content: `User # ${index + 1} some mocked content`,
                        userId: value
                    }),
                    headers: {'Content-Type': 'application/json'}
                })  
            }
        }

        for (let i = 1; i < usersId.length-1; i++) {
            subscribe(usersId[usersId.length-1], usersId[i]);
        }

        for (let i = 0; i < usersId.length-1; i++) {
            subscribe(usersId[i], usersId[usersId.length-1]);
        }

        return { 
            "created users": usersId,
            "created profiles": profilesId,
            "created posts": postCounter,
        };

    }
    );
};

export default plugin;


const subscribe = async (user1id: string, user2id: string) => {
            
    await fetch(`http://127.0.0.1:3000/users/${user2id}/subscribeTo`, {
        method: 'post',
        body: JSON.stringify({
            userId: user1id
        }),
        headers: {'Content-Type': 'application/json'}
    }) 
}