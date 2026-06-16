import { getPrismaClient } from '../db/index.js';

export const db = async (client) => client ?? getPrismaClient();
