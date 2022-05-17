import { PrismaClient, ShortAnswer } from '@prisma/client';
import { NextApiHandler } from 'next';
import { v1 } from 'uuid';

const shortAnswerCollection = new PrismaClient().shortAnswer;

const getShortAnswersBetween = (startDate?: Date, endDate?: Date) => {
  if (startDate && endDate) {
    return shortAnswerCollection
      .findMany({
        where: {
          AND: [
            { createdAt: { gte: startDate } },
            { createdAt: { lte: endDate } },
          ],
        },
      });
  }

  if (startDate) {
    return shortAnswerCollection
      .findMany({
        where: {
          createdAt: { gte: startDate },
        },
      });
  }

  return shortAnswerCollection.findMany();
};

const storeShortAnswer = (shortAnswer: ShortAnswer) => shortAnswerCollection
  .create({ data: shortAnswer });

const handler: NextApiHandler = async ({ method, query, body }, res) => {
  try {
    switch (method) {
      case 'GET':
        const startDateQuery = String(query.startDate);
        const endDateQuery = String(query.endDate);

        const parsedStartDate = Date.parse(startDateQuery);
        const parsedEndDate = Date.parse(endDateQuery);

        const startDate = isNaN(parsedStartDate)
          ? undefined : new Date(parsedStartDate);
        const endDate = isNaN(parsedEndDate)
          ? undefined : new Date(parsedEndDate);

        const shortAnswers = await getShortAnswersBetween(startDate, endDate);

        res.status(200).json(shortAnswers);
        break;
      case 'POST':
        const shortAnswer = await storeShortAnswer({
          id: v1(),
          value: body.value,
          createdAt: new Date(),
        });

        res.status(201).json(shortAnswer);
        break;
      default:
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default handler;
