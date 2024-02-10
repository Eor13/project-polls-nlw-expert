import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
    log:["query"] //Faz log toda vez que uma query for criada
})