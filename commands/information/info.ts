import Command, { ICommandSubHelp } from "../../classes/command";
import {
  https, http, bot, rejct, User, Constants, formatStatus, formatActivity, Embed, ago, momentUTC, _, TextChannel,
  search, cross, no2Tick, escMarkdown, GuildMember, Role, GuildChannel, globalPositions, capitalize, paginate, sleep
} from "../../misc/d";
import { cmdFunc, TContext, BaseContext, DjsChannel } from "../../misc/contextType";
import { Guild, GuildEmoji, Collection } from "discord.js";
import { ExtendedMsgOptions } from "../../handlerfuncs/senders/proto-send";
import { SearchType } from "../../funcs/parsers/search";
import { Storage } from "saltjs";

import { userinfo } from "./userinfo";
import { channelinfo } from "./channelinfo";
import { perms } from "./perms";
import { botinfo } from "./botinfo";
import { serverinfo } from "./serverinfo";
import { roleinfo } from "./roleinfo";
import { roles } from "./roles";
import { members } from "./members";
import { channels } from "./channels";
import { membercount } from "./membercount";
import { saltperms } from "./saltperms";

export type AInfoDummy = InfoDummy & { arg?: string, trArg?: string };

export interface InfoDummy {
  android?: boolean;
  action?: string;
}

/**
 * Info actions that can be used outside of guilds, even if limitedly
 */
export type NoGInfoAction = "user"   | "member"       | "id"             | "userid" |
  "channel"      | "textchannel"     | "text"         | "channelid"      | "textid" | "textchannelid" |
  "voicechannel" | "voice"           | "voiceid"      | "voicechannelid" |
  "perms"        | "dperms"          | "discordperms" | // when out of a guild, you can only specify a number
  "category"     | "categoryid"      | "ctg"          | "ctgid"          |
  "stats"        | "bot";

/**
 * Info actions that can be used inside guilds (excluding those that also can be used outside)
 */
export type GInfoAction = "server"     | "guild"     | "serverid"      | "guildid"      |
"members"     | "channels"             | "voices"    | "voicechannels" | "textchannels" | "texts" | "categories" | "ctgs" |
"emoji"       | "emojiid"              |
"role"        | "roleid"               | "roles"     |
"cperms"      | "channelperms"         |
"saltperms"   | "stperms"              | "listperms" |
"membercount" | "count"                |
"readers"     | "listeners";

/**
 * All actions
 */
export type InfoAction = GInfoAction | NoGInfoAction;

export type CollVal<T extends (Collection<any, any> | Storage<any, any>), R = any> =
  T extends Collection<any, infer CV> ?
    CV :
    T extends Storage<any, infer SV> ?
      SV :
      R;

export type CollKey<T extends (Collection<any, any> | Storage<any, any>), R = any> =
  T extends Collection<infer CK, any> ?
    CK :
    T extends Storage<infer SK, any> ?
      SK :
      R;

const noGActions: NoGInfoAction[] = [
  "user", "member", "id", "userid",
  "channel", "textchannel", "text", "channelid", "textid", "textchannelid",
  "voicechannel", "voice", "voiceid", "voicechannelid",
  "perms", "dperms", "discordperms", // when out of a guild, you can only specify a number
  "category", "categoryid", "ctg", "ctgid",
  "stats", "bot"];
const gActions: InfoAction[] = (noGActions as InfoAction[]).concat([
  "server", "guild", "serverid", "guildid",
  "members", "channels", "voices", "voicechannels", "textchannels", "texts", "categories", "ctgs",
  "emoji", "emojiid",
  "role", "roleid", "roles",
  "cperms", "channelperms",
  "saltperms", "stperms", "listperms", // I was going to alias it with "sperms" but then I realized...
  "membercount", "count",
  "readers", "listeners"
] as GInfoAction[]);

const noGCmds = {
  user: userinfo, member: userinfo, id: userinfo, userid: userinfo,

  channel: channelinfo, textchannel: channelinfo, text: channelinfo, channelid: channelinfo,
  textid: channelinfo, textchannelid: channelinfo,

  voicechannel: channelinfo, voice: channelinfo, voiceid: channelinfo, voicechannelid: channelinfo,

  perms, dperms: perms, discordperms: perms,

  category: channelinfo, categoryid: channelinfo, ctg: channelinfo, ctgid: channelinfo,

  stats: botinfo, bot: botinfo
};

const onlyGCmds = {
  server: serverinfo, guild: serverinfo, serverid: serverinfo, guildid: serverinfo,
  role: roleinfo, roleid: roleinfo, roles,
  members,

  channels, voices: channels, voicechannels: channels, textchannels: channels, texts: channels, categories: channels,
  ctgs: channels,

  saltperms, stperms: saltperms, listperms: saltperms,

  membercount, count: membercount,

  readers: members, listeners: members,
};

const gCmds = Object.assign(onlyGCmds, noGCmds);

type SubHelper<K> = Command | {
  cmd: Command,
  aliases?: K[];
  /** If should look for the command in aliases to get data, default false */
  lookInAliases?: boolean;
};
type SubHelpsHelperObj<Sp> = {
  [K in keyof Sp]?: SubHelper<keyof Sp>;
};
const subHelpsHelper: {
  noG: SubHelpsHelperObj<typeof noGCmds>;
  g: SubHelpsHelperObj<typeof onlyGCmds>;
} = {
  noG: {
    //#region user
    user: {
      cmd: userinfo,
      aliases: ["member"]
    },
    userid: {
      cmd: userinfo,
      aliases: ["id"],
      lookInAliases: true
    },
    //#endregion
    //#region channels
    channel: {
      cmd: channelinfo,
      aliases: ["textchannel", "text"]
    },
    channelid: {
      cmd: channelinfo,
      aliases: ["textchannelid", "textid"],
      lookInAliases: true
    },
    voicechannel: {
      cmd: channelinfo,
      aliases: ["voice"],
      lookInAliases: true
    },
    voicechannelid: {
      cmd: channelinfo,
      aliases: ["voiceid"],
      lookInAliases: true
    },
    category: {
      cmd: channelinfo,
      aliases: ["ctg"]
    },
    categoryid: {
      cmd: channelinfo,
      aliases: ["ctgid"]
    },
    //#endregion
    perms: {
      cmd: perms,
      aliases: ["dperms", "discordperms"]
    },
    bot: {
      cmd: botinfo,
      aliases: ["stats"]
    }
  },
  g: {
    server: {
      cmd: serverinfo,
      aliases: ["guild"]
    },
    serverid: {
      cmd: serverinfo,
      aliases: ["guildid"],
      lookInAliases: true
    },
    role: roleinfo,
    roleid: {
      cmd: roleinfo,
      lookInAliases: true
    },
    roles,
    members,
    channels: {
      cmd: channels,
      aliases: ["voicechannels", "voices", "textchannels", "texts", "categories", "ctgs"]
    },
    saltperms: {
      cmd: saltperms,
      aliases: ["stperms", "listperms"]
    },
    membercount: {
      cmd: membercount,
      aliases: ["count"]
    },
    readers: {
      cmd: members,
      lookInAliases: true
    },
    listeners: {
      cmd: members,
      lookInAliases: true
    }
  }
};

const subHelps = {};

for (const cat of Object.getOwnPropertyNames(subHelpsHelper) as Array<keyof typeof subHelpsHelper>) {
  const obj: SubHelpsHelperObj<{ [prop: string]: any }> = subHelpsHelper[cat];
  for (
    const hname of Object.getOwnPropertyNames(obj) as Array<keyof typeof obj>
  ) {
    const helper = obj[hname];
    let subHelpObj: ICommandSubHelp = {};
    if (helper instanceof Command) {
      subHelpObj = Object.assign({}, helper, { aliases: [] });
    } else {
      const { cmd, aliases, lookInAliases } = helper;
      let cmdToUse: Command = cmd;
      if (lookInAliases) {
        if (!cmd.aliases) continue;
        if (hname in cmd.aliases) {
          cmdToUse = cmd.aliases[hname];
        } else {
          for (const alias of Object.values(cmd.aliases)) {
            if (alias.aliases && hname in alias.aliases) cmdToUse = cmd.aliases[hname];
          }
        }
      }
      if (!cmdToUse) continue;
      subHelpObj = Object.assign({}, cmd, { aliases } as { aliases: string[] });
    }
    subHelps[hname] = subHelpObj;
  }
}

const func: cmdFunc<InfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member
}) {
  const sendIt = (emb: Embed, opts?: ExtendedMsgOptions) => {
    return send(Object.assign({ embed: emb, autoCatch: false, deletable: true }, opts))
      .catch(err => [403, 50013].includes(err.code) ?
        send("Please make sure I can send embeds in this channel.") :
        void(rejct(err, "[SEND-IT-INFO]"))
      );
  };
  let action: string = String(dummy && dummy.action ? dummy.action : String(arrArgs[0] || ""))
    .toLowerCase()
    .replace(/info$/i, "");
  let isAndroid: boolean = Boolean(dummy && dummy.android !== null ? dummy.android : false);
  const isInG = (chan): chan is TextChannel => channel instanceof TextChannel;
  const isDM: boolean = !isInG(channel);
  if (/^a(?:ndroid)?/i.test(action)) {
    action = action.replace(/^a(?:ndroid)?/i, "");
    isAndroid = true;
  }
  const arrArg: string[] = arrArgs.slice(dummy && dummy.action ? 0 : 1);
  const arg: string = arrArg.join(" ");
  const trArg = _.trim(arg);
  const is = (...list: string[]) => list.includes(action);
  const usableActions: string[] = guild ? gActions : noGActions;
  if (!_.trim(action)) {
    return reply("Please specify something to view information for! (See the help command if you need help.)");
  }
  if (!usableActions.includes(action)) {
    if (gActions.includes(action as InfoAction)) {
      return reply("You can only view that info when on a server!");
    }
    return reply("Unknown action (info to view)! (See the help command if you need help.)");
  }
  const newContext = self;
  const newDummy: AInfoDummy = {
    arg, trArg, action, android: isAndroid
  };
  Object.assign(newContext, { dummy: newDummy, arrArgs: arrArg, args: arg });
  const objToUse = guild ? gCmds : noGCmds;
  const theCmd: Command<AInfoDummy, BaseContext<DjsChannel>> = objToUse[action as keyof typeof objToUse];
  if (!theCmd) return reply("This info isn't available yet on Salt :)");
  return theCmd.exec(msg, newContext);
};

export const info = new Command({
  func,
  name: "info",
  perms: {
    "info.user": true, "info.role": true, "info.channel": true, "info.server": true,
    "info.bot": true, "info.roles": true, "info.channels": true, "info.members": true,
    "info.readers": true, "info.listeners": true,
    "info.perms": true, "info.saltperms": true, "info.membercount": true
  },
  default: true,
  description: `Show information about something. To use, specify an action. For a list of actions, \
view {p}help Information (without any 'info' at the end).

Note: If you add the letter \`a\` in front of any action, it shows it without mentions.`,
  example: `{p}{name} user
{p}{name} bot
{p}{name} server
{p}{name} role My Cool Role
{p}{name} channels 1`,
  category: "Information",
  args: { action: false, "...parameters": true },
  subHelps
});
