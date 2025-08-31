import pkg from '@prisma/client';
const {PrismaClient} = pkg;
const prisma = new PrismaClient();
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fal } from "@fal-ai/client";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY );
