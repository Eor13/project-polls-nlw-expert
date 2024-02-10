import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { FastifyInstance } from 'fastify'
import { redis } from '../../lib/redis'

export async function getPoll(app:FastifyInstance) {
    app.get("/polls/:pollId", async (request, reply)=>{
        const getPollParams = z.object({
            pollId:z.string().uuid()
        })    //informa a estrutura que o resquest body deve ter

        const { pollId } = getPollParams.parse(request.params)

        const poll = await prisma.poll.findUnique({
            where: {
                id: pollId,
            },
            include:{  //inclui dados de relacionamento com outras tabelas
                option:{
                    select:{
                        id: true,
                        title:true,
                    }
                }
            }
        })

        if(!poll){
            return reply.status(400).send({message:"Poll not found."})
        }

        const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')
        /*
        retorna o rank da chave PollId<enquente>
            key - é a chave da enquete, no caso o pollID
            min -  posição inicial, no caso é a 0
            max -  posição final, no caso é -1, pois retorna todas as posições
            'withscores' - retorna as opções com as pontuações, sem ele só retornaria as opções.
        */
        const votes = result.reduce((obj, line, index) => {
            if(index % 2 === 0){
                const score = result[index+1]

                Object.assign(obj, { [line]: Number(score) })
            }
            return obj
        }, {} as Record< string , number >)
       

        return reply.send({
            poll:{
                id: poll.id,
                title:poll.title,
                options: poll.option.map( option => {
                    return{
                        id:option.id,
                        title: option.title,
                        score: (option.id in votes) ? votes[option.id] : 0
                    }
                })
            }
        })
    })
}