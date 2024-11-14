import { DatabaseError } from "../../@types/customError";
import platformModels from "../models";

const ChatHistoryDB = {
	create: async (data: ChatHistoryObject) => {
		const newData = new platformModels.ChatHistoryModel(data);
		const saveData = await newData.save();

		if (!saveData) {
			throw new DatabaseError("ChatHistoryDB Database Error");
		}

		return saveData;
	},

	findOne: async ({ filter }: { filter: any }) => {
		return platformModels.ChatHistoryModel.findOne(filter);
	},

	find: async ({ filter }: { filter: any }) => {
		return platformModels.ChatHistoryModel.find(filter);
	},

	findChatHistorys: async (email: string) => {
		return await platformModels.ChatHistoryModel.aggregate([{
			$match: {
				email: email,
			}
		}, {
			$sort: {
				createdAt: -1
			}
		}, {
			$limit: 30
		}, {
			$sort: {
				createdAt: 1
			}
		}, {
			$project: {
				_id: 0,
				role: 1,
				content: "$text",
				image: 1,
				time: "$updatedAt",
			}
		}])
	},

	update: async ({ filter, update }: { filter: any, update: any }) => {
		return platformModels.ChatHistoryModel.findOneAndUpdate(filter, update);
	},

	remove: async ({ filter }: { filter: any }) => {
		const res: any = await platformModels.ChatHistoryModel.deleteOne(filter);
		return { found: res.n, deleted: res.deletedCount };
	}
}

export { ChatHistoryDB };