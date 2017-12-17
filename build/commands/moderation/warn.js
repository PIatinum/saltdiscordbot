"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { warns as warnsModel, warnsteps } from "../../sequelize/sequelize";
const warn_1 = require("../../punishments/warn");
const deps_1 = require("../../util/deps");
const func = async (msg, { guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms, searcher, promptAmbig, author, botmember, member, actionLog, dummy, checkRole, setPerms, self, }) => {
    let hasPerm = false;
    try {
        if (checkRole("mod", member)) {
            hasPerm = true;
        }
    }
    catch (err) {
        deps_1.logger.error(`At check role: ${err}`);
    }
    if (setPerms.warn) {
        hasPerm = setPerms.warn;
    }
    if (!hasPerm) {
        return reply("You do not have sufficient permissions! :frowning:");
    }
    if (!args) {
        return reply("Please tell me who to warn!");
    }
    const [user, reason] = deps_1._.tail((args.match(deps_1.Constants.regex.BAN_MATCH) || Array(3)));
    if (!user && !reason) {
        return;
    }
    let memberToUse;
    let membersMatched;
    if (/[^]#\d{4}$/.test(user)) {
        const split = user.split("#");
        const discrim = split.pop();
        const username = split.join("#");
        memberToUse = guild.members.find((m) => m.user.username === username && m.user.discriminator === discrim);
    }
    else if (/^<@!?\d+>$/.test(user)) {
        memberToUse = guild.members.get(user.match(/^<@!?(\d+)>$/)[1]);
    }
    if (!memberToUse) {
        membersMatched = searcher.searchMember(user);
    }
    if (membersMatched && membersMatched.length < 1) {
        return reply("Member not found!");
    }
    else if (membersMatched && membersMatched.length === 1) {
        memberToUse = membersMatched[0];
    }
    else if (membersMatched && membersMatched.length > 1 && membersMatched.length < 10) {
        const result = await promptAmbig(membersMatched);
        if (result.cancelled) {
            return;
        }
        memberToUse = result.member;
    }
    else if (membersMatched) {
        return reply("Multiple members have matched your search. Please be more specific.");
    }
    if (!memberToUse) {
        return;
    }
    await warn_1.default.punish(memberToUse, {
        author: member, reason, auctPrefix: `[Warn command executed by ${author.tag}] `, context: self, automatic: false,
    });
};
exports.warn = new deps_1.Command({
    func,
    name: "warn",
    perms: "warn",
    description: "Warn a member.",
    example: "{p}warn @EvilGuy#0010 Spamming a bit",
    category: "Moderation",
    args: { member: false, reason: true },
    guildOnly: true,
    default: false,
});