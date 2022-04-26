const moment = require("moment");
const {
	findQuestionMasterById,
	findOptionA,
	findOptionB,
} = require("../../Dao/questionMaster");
const {
	findMetaData,
	findAllQuesMasterByQuestionId,
} = require("../../Dao/questionMetadata");
const {
	findRecordByUserId,
	findUserByUserId,
	findUserBySlackId,
	findByUserInRecords
} = require("../../Dao/Records");
const {
	findAllGameByChannelId,
	updateGameById,
	findGameByGameId,
} = require("../../Dao/games");
const { findUserById } = require("../../Dao/user");
const { findChannelById } = require("../../Dao/Channels");
const {
	findGameByGameIdAndUserId,
	findVoteByPairedUser,
	findUsersByGameIdAndQuestionId,
} = require("../../Dao/vote_metadata");
const { isEmpty } = require("lodash");
const { auth } = require("../slack/slack.helper");
const { pairingResult, lastPollingResult } = require("../../helpers/design");
const {
	createUserPair,
	findUserPairByChannel,
	findPairUser,
	updateUser,
	updateUserLogin,
	findLoginPairUser,
	findUser,
	findOldLoginPair,
	findOldPairUser,
} = require("../../Dao/userPair");
const { findTokenByBotId } = require("../../Dao/slackbot");
const {
	TOKEN_NOT_FOUND,
	CHANNEL_NOT_EXIST,
	GROUP_NOT_FOUND,
	MAIN_CONTENT,
} = require("../../helpers/messages");

exports.userPairFind = async (userId) => {
	try {
		let gameArray = [];
		let userPairArray = [];
		let result;
		let gameData;
		let userLogin;
		let userPair;
		let channelRecord;
		let pairValue;
		let loginValueData;
		let alreadyPairedUser;
		let getUserId;
		let loginUserVote;

		userPair = await findRecordByUserId(userId);
		userLogin = await findUserByUserId(userId);
		const oldPair = await findOldLoginPair(userLogin.slack_id);
		const oldLoginPair = await findOldPairUser(userLogin.slack_id);
		if (!isEmpty(userPair)) {
			for (const record of userPair) {
				gameData = await findAllGameByChannelId(record.channel_id);
				gameArray = [...gameArray, ...gameData];
			}

			for (const game of gameArray) {
				let teamArray = [];
				const gameDate = moment(game.end_at).add(1, 'hours');
				const currentDate = moment().utc();
				if (gameDate > currentDate && currentDate > game.end_at) {
					channelRecord = await findChannelById(game.channel_id);
					alreadyPairedUser = await findUser(
						userLogin.slack_id,
						channelRecord.id,
						game.id
					);

					// alreadyPair User first time
					if (!isEmpty(alreadyPairedUser)) {
						teamArray = [];
						const exsitingUser = await findUserBySlackId(
							alreadyPairedUser.user_pair_id
						);
						teamArray.push(exsitingUser.user_id);
						result = await findGameByGameIdAndUserId(game.id, exsitingUser.user_id);
					} else {
						if (channelRecord.teams.includes(userId)) {
							for (const team of channelRecord.teams) {
								const voteData = await findGameByGameIdAndUserId(game.id, team);
								loginUserVote = await findGameByGameIdAndUserId(game.id, userId);
								if (!isEmpty(voteData) && !isEmpty(voteData.channel_id)) {
									pairValue = await findLoginPairUser(
										userLogin.slack_id,
										voteData.channel_id,
										game.id
									);
									if (pairValue) {
										const user = await findUserBySlackId(
											pairValue.user_login_id
										);
										teamArray.push(user.user_id);
									} else {
										const loginValue = await findPairUser(
											voteData.channel_id,
											game.id
										);
										if (loginValue) {
											loginValueData = await findUserBySlackId(
												loginValue.user_login_id
											);
											pairValue = await findUserBySlackId(
												loginValue.user_pair_id
											);
										}
										if (team !== userId && voteData && loginUserVote) {
											teamArray.push(team);
										}
									}
								}
							}
							if (loginValueData && !pairValue) {
								const loginUser = await findUserByUserId(
									loginValueData.user_id
								);
								const pairUser = await findUserByUserId(userId);
								const data = await findUserPairByChannel(
									loginUser.slack_id,
									pairUser.slack_id,
									loginValueData.channel_id
								);
								if (data) {
									loginValueData = await findUserBySlackId(data.user_login_id);
									teamArray.push(loginValueData.user_id);
								}
							}
							if (loginValueData && pairValue) {
								teamArray = teamArray.filter(
									(e) => e != loginValueData.user_id && e != pairValue.user_id
								);
							}
						} else {
							return {
								err: true,
								msg: CHANNEL_NOT_EXIST,
							};
						}
					}
					let oddTeamArray = [];
					// found odd length of array
					if (teamArray.length === 2) {
						for (const user of teamArray) {
							getUserId = user;
							oddTeamArray.push(getUserId);
						}
						for (const getUserId of oddTeamArray) {
							result = await findGameByGameIdAndUserId(game.id, getUserId);
							if (!isEmpty(result)) {
								userPair = await findUserByUserId(getUserId);
								const dataUserPair = await findUserPairByChannel(
									userLogin.slack_id,
									userPair.slack_id,
									result.channel_id,
									game.id
								);
								const dataLoginPair = await findUserPairByChannel(
									userPair.slack_id,
									userLogin.slack_id,
									result.channel_id,
									game.id
								);
								if (
									isEmpty(dataUserPair) &&
									isEmpty(dataLoginPair) &&
									isEmpty(alreadyPairedUser)
								) {
									await createUserPair({
										user_login_id: userLogin.slack_id,
										user_pair_id: userPair.slack_id,
										channel_id: result.channel_id,
										game_id: result.game_id,
									});
								}
							}
						}
					}
					// found even length of array
					else if (!alreadyPairedUser) {
						let newTeamArray = [];
						if (oldPair[0] || oldLoginPair[0]) {
							for (const user of teamArray) {
								let userData;
								if (oldPair && oldPair[0] && oldPair[0].user_pair_id) {
									userData = await findUserBySlackId(oldPair[0].user_pair_id);
								}
								if (
									oldLoginPair &&
									oldLoginPair[0] &&
									oldLoginPair[0].user_login_id
								) {
									userData = await findUserBySlackId(
										oldLoginPair[0].user_login_id
									);
								}
								if (userData && userData.user_id !== user && user !== userId) {
									newTeamArray.push(user);
								}
							}
						}
						if (newTeamArray.length === 0) {
							newTeamArray = teamArray;
						}
						if (loginUserVote) {
							const randomIndex = Math.floor(Math.random() * newTeamArray.length);
							getUserId = newTeamArray[randomIndex];
							result = await findGameByGameIdAndUserId(game.id, getUserId);
							if (!isEmpty(result)) {
								userPair = await findUserByUserId(getUserId);
								const dataUserPair = await findUserPairByChannel(
									userLogin.slack_id,
									userPair.slack_id,
									result.channel_id,
									game.id
								);
								const dataLoginPair = await findUserPairByChannel(
									userPair.slack_id,
									userLogin.slack_id,
									result.channel_id,
									game.id
								);
								if (
									isEmpty(dataUserPair) &&
									isEmpty(dataLoginPair) &&
									isEmpty(alreadyPairedUser)
								) {
									await createUserPair({
										user_login_id: userLogin.slack_id,
										user_pair_id: userPair.slack_id,
										channel_id: result.channel_id,
										game_id: result.game_id,
									});

								}
							}
						}
					}
					if (!isEmpty(result)) {
						const questionMasterData = await findQuestionMasterById(
							result.question_master_id
						);
						userPair = await findUserByUserId(result.user_id);
						if (isEmpty(questionMasterData)) {
							userPairArray = [];
							return {
								err: false,
								msg: userPairArray,
							};
						}
						const questionData = await findMetaData(
							questionMasterData.question_id
						);
						const optionA = await findOptionA(questionData.option_a);
						const optionB = await findOptionB(questionData.option_b);
						let user;
						user = await findUser(userLogin.slack_id, result.channel_id, result.game_id);
						if (user) {
							result.dataValues.userLogin = user.user_login;
						} else {
							user = await findLoginPairUser(userLogin.slack_id, result.channel_id, result.game_id);
							result.dataValues.userLogin = user.user_pair;
						}
						result.dataValues.userLoginId = userId;
						result.dataValues.optionAId = optionA.id;
						result.dataValues.optionA = optionA.option;
						result.dataValues.imageURLA = optionA.image_url;
						result.dataValues.optionBId = optionB.id;
						result.dataValues.optionB = optionB.option;
						result.dataValues.imageURLB = optionB.image_url;
						result.dataValues.vote = questionMasterData.option;
						result.dataValues.name = userPair.name;
						delete result.dataValues.question_master_id;
						userPairArray.push(result);
					} else {
						userPairArray = [];
						return {
							err: false,
							msg: userPairArray,
						};
					}
				}
			}
		}
		return {
			err: false,
			msg: userPairArray,
		};
	} catch (error) {
		console.log(error);
	}
};

exports.guessOption = async (userPairId, channelId, userLoginId, gameId) => {
	try {
		let channelData;
		const userLogin = await findUserById(userLoginId);
		const token = await findTokenByBotId(userLogin.bot_user_id);
		if (isEmpty(token)) {
			return {
				err: true,
				msg: TOKEN_NOT_FOUND,
			};
		}
		const client = await auth(token.bot_token);
		const gameData = await findGameByGameId(gameId);
		const pairVote = await findVoteByPairedUser(userPairId, channelId, gameId);
		const pairOption = await findQuestionMasterById(
			pairVote.question_master_id
		);
		const loginVote = await findVoteByPairedUser(
			userLoginId,
			channelId,
			gameId
		);
		const loginOption = await findQuestionMasterById(
			loginVote.question_master_id
		);
		const userPair = await findByUserInRecords(userPairId, channelId);
		const loginPair = await findByUserInRecords(userLoginId, channelId);
		if (!isEmpty(gameId)) {
			const gameDetails = await findGameByGameId(gameId);
			if (!isEmpty(gameDetails) && isEmpty(gameDetails.scheduled_vote_id)) {
				const channelDetails = await findChannelById(gameDetails.channel_id);
				const questionMetaId = gameDetails.question_meta_id;
				const result = userPollingResult(
					client,
					questionMetaId,
					gameDetails,
					channelDetails
				);
				if (!isEmpty(result) && result.err) {
					return result;
				}
			}
		}
		const pairValue = {
			userLoginName: userLogin.name,
			userPairName: userPair.name,
			loginOption: loginOption.option,
			pairOption: pairOption.option,
			loginURL: loginOption.image_url,
			pairURL: pairOption.image_url,
		};

		const loginData = await findUserPairByChannel(loginPair.slack_id, userPair.slack_id, channelId, gameId);
		const pairData = await findUserPairByChannel(userPair.slack_id, loginPair.slack_id, channelId, gameId);

		if (loginData && !loginData.user_login) {
			await updateUser(loginData.user_login_id, loginData.user_pair_id, channelId, gameId);
		}

		if (pairData && !pairData.user_pair) {
			await updateUserLogin(pairData.user_login_id, pairData.user_pair_id, channelId, gameId);
		}

		if ((loginData && !loginData.user_login && !loginData.user_pair) || (pairData && !pairData.user_pair && !pairData.user_login)) {
			const date = moment(gameData.end_at).add(2, "hours").format("YYYY-MM-DD HH:mm:ss");
			const unixTime = moment(date).unix();

			channelData = await client.conversations.open({
				token: token.bot_token,
				users: `${loginPair.slack_id},${userPair.slack_id}`,
			});
			const block = await pairingResult(pairValue);
			const result = await client.chat.scheduleMessage({
				channel: channelData.channel.id,
				blocks: block,
				text: 'Pairing Result',
				post_at: unixTime,
			});
			await updateGameById('scheduled_group_id', result.scheduled_message_id, gameId);
		}
	} catch (error) {
		console.log(error);
	}
};

async function userPollingResult(
	client,
	questionMetaId,
	gameDetails,
	channelDetails
) {
	try {
		const questionDetails = await findAllQuesMasterByQuestionId(questionMetaId);
		const questionOption = questionDetails[0].question_masters;
		if (!isEmpty(questionDetails)) {
			const optionA = [];
			const optionB = [];
			for (const options of questionOption) {
				if (options.option !== MAIN_CONTENT) {
					const data = {
						id: options.id,
						option: options.option,
					};
					if (!isEmpty(optionA)) {
						optionB.push(data);
					} else {
						optionA.push(data);
					}
				}
			}
			if (!isEmpty(optionA) && !isEmpty(optionB)) {
				const user1 = await findUsersByGameIdAndQuestionId(
					gameDetails.id,
					optionA[0].id
				);
				const user2 = await findUsersByGameIdAndQuestionId(
					gameDetails.id,
					optionB[0].id
				);
				const design = await lastPollingResult(optionA, user1, optionB, user2);
				const channelId = channelDetails.channel_id;
				if (!isEmpty(channelId)) {
					const date = moment(gameDetails.end_at).add(2, "hours").format("YYYY-MM-DD HH:mm:ss");
					const unixTime = moment(date).unix();
					const result = await client.chat.scheduleMessage({
						channel: channelId,
						text: "Game Result",
						blocks: design,
						// Time to post message, in Unix Epoch timestamp format
						post_at: unixTime,
					});
					await updateGameById(
						"scheduled_vote_id",
						result.scheduled_message_id,
						gameDetails.id
					);
					return {
						err: false,
						msg: result,
					};
				}
			}
		}
	} catch (err) {
		return {
			err: true,
			msg: `${err.data.error}`,
		};
	}
}
